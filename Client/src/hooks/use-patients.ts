import APIClient from "@/core/ApiClient";
import { createQueryHook } from "./use-http";
import type { GetPatientAppointmentsResponse } from "@/types/patients";
import { type AppointmentPatientResponse } from "@/types/appointment";

const api = new APIClient("/patients/me");

const patientKeys = {
  me: ["me"] as const,
  appointments: () => [...patientKeys.me, "appointments"] as const,
  appointment: (id: string) => [...patientKeys.appointments(), id] as const,
};

export const useGetPatientAppointments = createQueryHook(
  () => patientKeys.appointments(),
  () =>
    api
      .get<GetPatientAppointmentsResponse>("appointments")
      .then((res) => res.data),
);

export const useGetPatientAppointment = createQueryHook(
  (id?: string) => patientKeys.appointment(id!),
  (id) =>
    api
      .get<AppointmentPatientResponse>(`appointments/${id}`)
      .then((res) => res.data),
);
