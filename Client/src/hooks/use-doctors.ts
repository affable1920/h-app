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
  GetDoctorClinicsResponse,
} from "@/types/doctors";
import type {
  GetDoctorAppointmentsResponse,
  GetDoctorAppointmentsParams,
} from "@/types/appointment";
import { useSignup, type ProfileResponse } from "./use-auth";
import { keepPreviousData } from "@tanstack/react-query";
import type { PaginationParams } from "@/types/pagination";
import queryClient from "@/core/query-client";

const api = new APIClient("/doctors");

type DoctorProfile = ProfileResponse<"doctor">;

export type DoctorFieldChange = NonNullable<
  {
    [K in keyof DoctorProfile]: {
      fieldName: K;
      fieldValue: DoctorProfile[K];
    };
  }[keyof DoctorProfile]
>;

interface UpdateDoctorVars {
  id: string;
  changes: DoctorFieldChange;
}

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
  ({ changes }: UpdateDoctorVars) =>
    api
      .put(
        `me`,
        {
          fieldValue: changes.fieldValue,
        },
        {
          params: { fieldName: changes.fieldName },
        },
      )
      .then((res) => res.data as DoctorProfile),
  (vars) => [doctorKeys.details(vars.id), doctorKeys.auth],
  {
    onMutate: async function (vars) {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: doctorKeys.details(vars.id) }),
        queryClient.cancelQueries({ queryKey: doctorKeys.auth }),
      ]);

      const previousAuth = queryClient.getQueryData<DoctorProfile>(
        doctorKeys.auth,
      );

      queryClient.setQueryData<DoctorProfile>(doctorKeys.auth, function (old) {
        if (!old) {
          return old;
        }

        return {
          ...(old as DoctorProfile),
          [vars.changes.fieldName]: vars.changes.fieldValue,
        };
      });

      return { previousAuth };
    },

    onError(_err, _vars, onMutateResult) {
      if (onMutateResult?.previousAuth) {
        queryClient.setQueryData<DoctorProfile>(
          doctorKeys.auth,
          onMutateResult.previousAuth,
        );
      }
    },

    onSettled: async function (_data, _err, vars) {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: doctorKeys.details(vars.id),
        }),
        queryClient.invalidateQueries({
          queryKey: doctorKeys.auth,
        }),
      ]);
    },
  },
);

export const doctorOptions = createQueryOptions(
  (id: string) => doctorKeys.details(id),
  (id) => api.get<GetDoctorResponse>(id).then((res) => res.data),
);

export const useGetDoctorAppointments = createQueryHook(
  (params) => doctorKeys.relations("appointments", params),
  (params: GetDoctorAppointmentsParams) =>
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
