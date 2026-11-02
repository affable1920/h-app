import APIClient from "@/core/ApiClient";
import { createQueryHook } from "./use-http";
import type { GetPatientAppointmentsResponse } from "@/types/patients";
import {
  type AppointmentPatientResponse,
  type GetPatientAppointmentsParams,
} from "@/types/appointment";
import { keepPreviousData } from "@tanstack/react-query";

const api = new APIClient("/patients/me");

const patientKeys = {
  me: ["me"] as const,
  appointments: (params?: GetPatientAppointmentsParams) =>
    [...patientKeys.me, "appointments", { ...params }] as const,
  appointment: (id: string) => [...patientKeys.appointments(), id] as const,
};

export const useGetPatientAppointments = createQueryHook<
  GetPatientAppointmentsParams,
  GetPatientAppointmentsResponse
>(
  (params) => patientKeys.appointments(params),
  (params) =>
    api
      .get<GetPatientAppointmentsResponse>("appointments", {
        params: {
          ...params,
        },
      })
      .then((res) => res.data),
  {
    placeholderData: keepPreviousData,
  },
);

export const useGetPatientAppointment = createQueryHook(
  (id?: string) => patientKeys.appointment(id!),
  (id) =>
    api
      .get<AppointmentPatientResponse>(`appointments/${id}`)
      .then((res) => res.data),
);
