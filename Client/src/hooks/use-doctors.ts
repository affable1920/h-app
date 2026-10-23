import APIClient from "@/core/ApiClient";
import { doctorKeys, type DoctorFilters } from "./keys";
import {
  createMutationHook,
  createQueryHook,
  createQueryOptions,
} from "./use-http";
import type {
  GetDoctorResponse,
  GetAllDoctorsResponse,
  GetDoctorAppointmentsResponse,
  GetDoctorClinicsResponse,
  PaginationParams,
} from "@/types/doctors";
import { useSignup } from "./use-auth";
import { keepPreviousData } from "@tanstack/react-query";

const api = new APIClient("/doctors");

export const useGetDoctors = createQueryHook(
  (filters: DoctorFilters) => doctorKeys.list(filters),
  (filters: DoctorFilters) =>
    api
      .get<GetAllDoctorsResponse>(undefined, {
        params: {
          ...filters,
        },
      })
      .then((res) => res.data),
  {
    placeholderData: keepPreviousData,
    refetchOnMount: false,
  },
);

export const useGetDoctor = createQueryHook(
  (id?: string) => doctorKeys.details(id!),
  (id) => api.get<GetDoctorResponse>(id).then((res) => res.data),
);

export function useCreateDoctor() {
  return useSignup(
    {
      route: "doctor",
      params: {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    },
    () => [doctorKeys.all],
  );
}

export const useUpdateDoctor = createMutationHook(
  <K extends string>({
    changes,
  }: {
    id: string;
    changes: { q: K; val: unknown };
  }) =>
    api
      .put(
        `me`,
        {
          val: changes.val,
        },
        {
          params: { q: changes.q },
        },
      )
      .then((res) => res.data),
  (vars) => [doctorKeys.details(vars.id), doctorKeys.auth],
);

export const doctorOptions = createQueryOptions(
  (id: string) => doctorKeys.details(id),
  (id) => api.get<GetDoctorResponse>(id).then((res) => res.data),
);

export const useGetDoctorAppointments = createQueryHook(
  (params) => doctorKeys.relations("appointments", params),
  (params: PaginationParams) =>
    api
      .get<GetDoctorAppointmentsResponse>(`me/appointments`, {
        params: {
          ...params,
        },
      })
      .then((res) => res.data),
  {
    placeholderData: keepPreviousData,
  },
);

export const useGetDoctorClinics = createQueryHook(
  (params: PaginationParams = {}) => doctorKeys.relations("clinics", params),
  (params) =>
    api
      .get<GetDoctorClinicsResponse>("me/clinics", {
        params: {
          ...params,
        },
      })
      .then((res) => res.data),
);

export const useCancelAppointment = createMutationHook(
  (scheduleId) => api.delete(`me/appointments/${scheduleId}`),
  (scheduleId: string) => [
    doctorKeys.relations("appointments"),
    doctorKeys.relation("appointments", scheduleId),
  ],
);

export const getDoctorsOptions = createQueryOptions(
  (vars) => doctorKeys.list(vars),
  (vars: DoctorFilters) =>
    api
      .get(undefined, {
        params: {
          ...vars,
        },
      })
      .then((r) => r.data),
);

export const parseDoctorParams = (sp: URLSearchParams) =>
  Object.fromEntries(sp.entries());
