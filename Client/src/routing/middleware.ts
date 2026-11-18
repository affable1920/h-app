import { redirect, type MiddlewareFunction } from "react-router-dom";
import { ensureSessionAtStartup } from "./restoreSession";
import type { Role } from "@/types/user";
import useAuthStore from "@stores/auth-store";

const WORKSPACE_INDEX = "/app/workspace";

const workspaceHomes = {
  doctor: WORKSPACE_INDEX + "/doctor/personal",
  patient: WORKSPACE_INDEX + "/patient/appointments",
} satisfies Record<Role, string>;

export const sessionMiddleware: MiddlewareFunction = async (_, next) => {
  const outcome = await ensureSessionAtStartup();

  if (outcome === "unavailable") {
    throw new Response("Could not restore your session. Please retry ..!", {
      status: 503,
      statusText: "Session unavailable",
    });
  }

  await next();
};

function requireStoredSession() {
  const { token, role } = useAuthStore.getState();

  if (!token || !role) {
    throw redirect("/auth");
  }

  return { token, role };
}

export const authMiddleware: MiddlewareFunction = async (_, next) => {
  requireStoredSession();
  await next();
};

export async function workspaceRedirect() {
  const { role } = requireStoredSession();
  return redirect(workspaceHomes[role]);
}

export function requireRole(expectedRole: Role) {
  return function () {
    const { role } = requireStoredSession();

    if (role !== expectedRole) {
      throw new Response("You cannot access this workspace ..", {
        status: 403,
        statusText: "Forbidden",
      });
    }

    return null;
  };
}

export function workspaceIndex(expectedRole: Role, homePage?: string) {
  return function () {
    requireRole(expectedRole)();
    return redirect(homePage ?? workspaceHomes[expectedRole]);
  };
}
