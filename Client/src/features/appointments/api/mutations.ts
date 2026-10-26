import APIClient from "@/core/ApiClient";
import { doctorKeys } from "@/hooks/keys";
import { createMutationHook } from "@/hooks/use-http";
import type { AppointmentDoctorResponse } from "@/types/appointment";

const api = new APIClient("/doctors/me/appointments");

export const useAppointmentCompletion = createMutationHook<
  { doctorId: string; appointmentId: string },
  AppointmentDoctorResponse
>(
  (vars) =>
    api
      .post<
        AppointmentDoctorResponse,
        undefined
      >(`${vars.appointmentId}/complete`, undefined)
      .then((res) => res.data),
  (vars) => [
    doctorKeys.relations("appointments"),
    ["appointments", "detail", "doctor", vars.doctorId, vars.appointmentId],
  ],
);
