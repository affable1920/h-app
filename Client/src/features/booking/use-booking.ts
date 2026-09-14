import APIClient from "@/core/ApiClient";
import type { Appointment, BookingRequestData } from "@/types/http";
import { createMutationHook } from "@/hooks/use-http";
import { doctorKeys } from "@/hooks/keys";

const api = new APIClient("/bookings");

export const useCreateBooking = createMutationHook(
  (data: BookingRequestData) =>
    api
      .post<Appointment, BookingRequestData>(undefined, data)
      .then((res) => res.data),
  (vars) => [doctorKeys.detail(vars.doctorId), ["auth", "me"]],
);

export const useCancelBooking = createMutationHook(
  (vars: { appointmentId: string; doctorId: string }) =>
    api.delete(`cancel/${vars.appointmentId}`),
  (vars) => [doctorKeys.detail(vars.doctorId), ["auth", "me"]],
);
