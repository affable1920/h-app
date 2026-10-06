import APIClient from "@/core/ApiClient";
import { createMutationHook } from "@/hooks/use-http";
import { doctorKeys } from "@/hooks/keys";
import type { BookingResponse, BookingSchema } from "../contract/types";

const api = new APIClient("/bookings");

export const useCreateBooking = createMutationHook(
  (vars: BookingSchema) =>
    api
      .post<BookingResponse, BookingSchema>(undefined, vars)
      .then((res) => res.data),
  (vars) => [
    ["auth", "me"],
    doctorKeys.relations("appointments"),
    doctorKeys.details(vars.doctorId),
  ],
);

export const useCancelBooking = createMutationHook(
  (vars: { appointmentId: string; doctorId: string }) =>
    api.delete(vars.appointmentId),
  (vars) => [
    ["auth", "me"],
    doctorKeys.relations("appointments"),
    doctorKeys.details(vars.doctorId),
  ],
);
