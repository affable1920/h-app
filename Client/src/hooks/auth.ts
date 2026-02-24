import { useMutation, useQuery } from "@tanstack/react-query";
import APIClient from "@/services/ApiClient";
import type { UserDB, UserLogin, UserCreate } from "@/types/http";
import useAuthStore from "@/stores/authStore";

const api = new APIClient("/auth");

export function useProfile() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const response = await api.get<UserDB>("me");
      return response.data;
    },
    staleTime: 7200,
    retry: false,
  });
}

export function useSignin() {
  return useMutation({
    mutationFn: async (user: UserLogin) => {
      const response = await api.post<UserDB, UserLogin>("login", user);

      const jwt = response.headers["x-auth-token"];

      if (!jwt) {
        throw new Error("no access token recieved on login...");
      }

      useAuthStore.getState().setUser(jwt);
    },
  });
}

export function useSignup() {
  return useMutation({
    mutationFn: async (user: UserCreate) => {
      const response = await api.post<UserDB, UserCreate>("register", user);

      const jwt = response.headers["x-auth-token"];

      if (!jwt) {
        throw new Error("no access token recieved on register...");
      }

      useAuthStore.getState().setUser(jwt);
    },
  });
}
