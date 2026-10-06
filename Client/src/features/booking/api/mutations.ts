import APIClient from "@/core/ApiClient";
import { createMutationHook } from "@/hooks/use-http";
import { doctorKeys } from "@/hooks/keys";
import type { BookingResponse, BookingSchema } from "../contract/types";

const api = new APIClient("/bookings");

export const useCreateBooking = createMutationHook(
  (data: BookingSchema) =>
    api
      .post<BookingResponse, BookingSchema>(undefined, data)
      .then((res) => res.data),
  () => [["auth", "me"], doctorKeys.relations("appointments")],
);

export const useCancelBooking = createMutationHook(
  (vars: { appointmentId: string; doctorId: string }) =>
    api.delete(vars.appointmentId),
  () => [["auth", "me"], doctorKeys.relations("appointments")],
);
