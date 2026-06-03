import { useMutation, useQuery } from "@tanstack/react-query";
import APIClient from "@/services/ApiClient";
import type {
  PatientCreate,
  DoctorLogin,
  PatientLogin,
  UserResponse,
  ProfileResponse,
  Role,
} from "@/types/http";
import useAuthStore from "@/stores/authStore";
import type { AxiosRequestConfig } from "axios";

type SignupContext =
  | { route: "doctor"; data: FormData }
  | { route: "patient"; data: PatientCreate };

type SigninContext =
  | { route: "doctor"; data: DoctorLogin }
  | { route: "patient"; data: PatientLogin };

const api = new APIClient("/auth");

export function useSignup() {
  const saveToken = useAuthStore((s) => s.saveToken);
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation<
    UserResponse,
    Error,
    SignupContext & { params?: AxiosRequestConfig }
  >({
    async mutationFn(context) {
      const ep = "register/" + context.route;
      const response = await api.post<UserResponse, SignupContext["data"]>(
        ep,
        context.data,
        {
          ...(context.params || {}),
        },
      );

      const jwt = response.headers["x-auth-token"];
      if (!jwt) {
        throw new Error("no access token recieved on register...");
      }

      saveToken(jwt);
      setUser(response.data);
      return response.data;
    },
  });
}

export function useSignin() {
  const saveToken = useAuthStore((s) => s.saveToken);
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation<
    UserResponse,
    Error,
    SigninContext & { params?: AxiosRequestConfig }
  >({
    async mutationFn(context) {
      const ep = "login/" + context.route;
      const response = await api.post<UserResponse, SigninContext["data"]>(
        ep,
        context.data,
        {
          ...(context.params || {}),
        },
      );

      const jwt = response.headers["x-auth-token"];

      if (!jwt) {
        throw new Error("Login failed.");
      }

      saveToken(jwt);
      setUser(response.data);
      return response.data;
    },
  });
}

export function useFetchProfile<R extends Role>(role: R) {
  return useQuery<ProfileResponse<R>>({
    queryKey: ["auth", "me", role],
    enabled: !!role,

    async queryFn() {
      const response = await api.get<ProfileResponse<R>>("me");
      return response.data;
    },

    retry: false,
  });
}
