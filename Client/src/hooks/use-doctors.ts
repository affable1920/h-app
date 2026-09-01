import APIClient from "@/core/ApiClient";
import { doctorKeys, type DoctorFilters } from "./keys";
import {
  createMutationHook,
  createQueryHook,
  createQueryOptions,
} from "./use-http";
import type {
  GetByIdResponse,
  GetAllDrResponse,
  UserResponse,
  Role,
  ProfileResponse,
} from "@/types/http";
import useAuthStore from "@/stores/auth-store";

const api = new APIClient("/doctors");

export const useDoctors = createQueryHook(
  (filters: DoctorFilters) => doctorKeys.list(filters),
  (filters: DoctorFilters) =>
    api
      .get<GetAllDrResponse>(undefined, {
        params: filters,
      })
      .then((res) => res.data),
);

export const useDoctor = createQueryHook(
  (id: string) => doctorKeys.detail(id),
  (id: string) => api.get<GetByIdResponse>(id).then((res) => res.data),
);

export const useCreateDoctor = createMutationHook(
  async function (vars: FormData) {
    const setUser = useAuthStore((s) => s.setUser);
    const saveToken = useAuthStore((s) => s.saveToken);

    const response = await api.post<UserResponse, FormData>(`register`, vars, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    const { headers, data: user } = response;
    const jwt = headers["x-auth-token"];

    if (!jwt) {
      throw new Error("Auto login failed. Please login manually.");
    }

    saveToken(jwt);
    setUser(user);

    return user;
  },
  () => [doctorKeys.lists()],
);

export const useUpdateDoctor = createMutationHook(
  <R extends Role, K extends keyof ProfileResponse<R>>({
    changes,
  }: {
    id: string;
    changes: { q: K; val: ProfileResponse<R>[K] };
  }) =>
    api
      .put(
        `edit`,
        {
          val: changes.val,
        },
        {
          params: { q: changes.q },
        },
      )
      .then((res) => res.data),
  (vars) => [doctorKeys.detail(vars.id), doctorKeys.lists(), doctorKeys.auth()],
);

// =======================================================================================================
// =======================================================================================================

export const doctorOptions = createQueryOptions(
  (id: string) => doctorKeys.detail(id),
  (id) => api.get<GetByIdResponse>(id).then((res) => res.data),
);
