import APIClient from "@/core/ApiClient";
import { doctorKeys, type DoctorFilters } from "./keys";
import {
  createMutationHook,
  createQueryHook,
  createQueryOptions,
} from "./use-http";
import type { GetByIdResponse, GetAllDrResponse } from "@/types/http";
import { useSignup } from "./use-auth";

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

export const useCreateDoctor = useSignup(
  {
    route: "doctor",
    params: {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  },
  () => [doctorKeys.lists()],
);

export const useUpdateDoctor = createMutationHook(
  <K extends string>({
    changes,
  }: {
    id: string;
    changes: { q: K; val: unknown };
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
