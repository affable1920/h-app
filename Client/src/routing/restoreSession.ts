import axios from "axios";
import { refresh } from "@/core/RefreshClient";
import type { IncomingErrorPayload } from "@/types/http";
import useAuthStore from "@/stores/auth-store";
import { getCookie, sleep } from "@/utils/utils";
import { jwtDecode } from "jwt-decode";

export type StartupRestoreOutcome = "ready" | "anonymous" | "unavailable";

export class NoRefreshSessionError extends Error {}
export class RefreshUnavailableError extends Error {}

// module scoped variable, shared by each consumer of the below function.
// It is "the" reference to the shared refresh operation.
let refreshInFlight: Promise<string> | null = null;

export function getFreshAccessToken(): Promise<string> {
  if (!refreshInFlight) {
    refreshInFlight = runRefreshWithRetry().finally(function () {
      refreshInFlight = null;
    });
  }

  return refreshInFlight;
}

async function runRefreshWithRetry(): Promise<string> {
  // only place that retries session refresh requests, knows about the
  // refresh policy, when and when not to retry.
  const { saveToken, setUser, clearAuth } = useAuthStore.getState();

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const token = await refresh();

      saveToken(token);
      setUser(jwtDecode(token));

      return token;
    } catch (error) {
      if (!axios.isAxiosError<IncomingErrorPayload>(error)) {
        throw error;
      }

      if (error.response?.status === 401) {
        clearAuth();
        throw new NoRefreshSessionError();
      }

      const payload = error.response?.data;

      const temporary =
        !error.response ||
        error.response.status === 408 ||
        error.response.status === 429 ||
        error.response.status === 500 ||
        (error.response.status === 409 &&
          payload?.code === "refresh_in_progress");

      if (temporary && attempt === 0) {
        await sleep(1000);
        continue;
      }

      throw new RefreshUnavailableError();
    }
  }

  throw new RefreshUnavailableError();
}

export async function ensureSessionAtStartup(): Promise<StartupRestoreOutcome> {
  if (useAuthStore.getState().token) {
    return "ready";
  }

  if (getCookie("has_session") !== "1") {
    return "anonymous";
  }

  try {
    await getFreshAccessToken();
    return "ready";
  } catch (error) {
    if (error instanceof NoRefreshSessionError) {
      return "anonymous";
    }

    if (error instanceof RefreshUnavailableError) {
      return "unavailable";
    }

    throw error;
  }
}

export function registerSessionListeners() {
  function tryRestore() {
    void ensureSessionAtStartup().catch(function (error) {
      console.error(error);
    });
  }

  function visibilityChange() {
    if (document.visibilityState === "visible") {
      tryRestore();
    }
  }

  window.addEventListener("online", tryRestore);
  document.addEventListener("visibilitychange", visibilityChange);

  return function () {
    window.removeEventListener("online", tryRestore);
    document.removeEventListener("visibilitychange", visibilityChange);
  };
}
