import { queryOptions, useQuery, type QueryKey } from "@tanstack/react-query";
import APIClient from "@/core/ApiClient";
import type {
  PatientCreate,
  DoctorLogin,
  PatientLogin,
  UserResponse,
  ProfileResponse,
  Role,
} from "@/types/http";
import useAuthStore from "@/stores/auth-store";
import type { AxiosRequestConfig } from "axios";
import { createMutationHook } from "./use-http";
import { doctorKeys } from "./keys";

type SignupContext = {
  params?: AxiosRequestConfig;
} & (
  | { route: "doctor"; data: FormData }
  | { route: "patient"; data: PatientCreate }
);

type SigninContext = { params?: AxiosRequestConfig } & (
  | { route: "doctor"; data: DoctorLogin }
  | { route: "patient"; data: PatientLogin }
);

const api = new APIClient("/auth");

export function useSignup<TVariables extends Omit<SignupContext, "data">>(
  vars: TVariables,
  invalidateKeys: (vars: TVariables) => Array<QueryKey>,
  options?: Parameters<typeof createMutationHook>["2"],
) {
  return createMutationHook(
    (payload: SignupContext["data"]) =>
      api.post<UserResponse, SignupContext["data"]>(
        `register/${vars.route}`,
        payload,
        {
          ...(vars.params || {}),
        },
      ),
    () => [["auth", "me"], ...invalidateKeys(vars)],
    {
      onSuccess(data, ...rest) {
        const { saveToken, setUser } = useAuthStore.getState();
        const { headers, data: created } = data;

        const jwt = headers["x-auth-token"];

        if (!jwt) {
          throw new Error("login failed.");
        }

        setUser(created);
        saveToken(jwt);

        options?.onSuccess?.(data, ...rest);
      },
    },
  );
}

export const useSignin = createMutationHook(
  (vars: SigninContext) =>
    api.post<UserResponse, SigninContext["data"]>(
      `login/${vars.route}`,
      vars.data,
      {
        ...(vars.params || {}),
      },
    ),
  () => [["auth", "me"]],
  {
    onSuccess(data) {
      const { saveToken, setUser } = useAuthStore.getState();
      const { headers, data: loggedinUser } = data;

      const jwt = headers["x-auth-token"];

      if (!jwt) {
        return;
      }

      saveToken(jwt);
      setUser(loggedinUser);
    },
  },
);

export function useFetchProfile<R extends Role>(role: R) {
  return useQuery(fetchProfileOptions<R>(role));
}

export const useDeleteAccount = createMutationHook(
  () => api.delete(""),
  (id: string) => [doctorKeys.detail(id), doctorKeys.lists()],
);

// ============================================================
export function fetchProfileOptions<R extends Role>(role: R) {
  return queryOptions({
    queryKey: ["auth", "me", role],
    enabled: !!role,
    async queryFn() {
      const response = await api.get<ProfileResponse<R>>("me");
      return response.data;
    },
    retry: 2,
  });
}
