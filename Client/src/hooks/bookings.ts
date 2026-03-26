import { useMutation, useQueryClient } from "@tanstack/react-query";

import APIClient from "@/services/ApiClient";
import type { Appointment, BookingRequestData } from "@/types/http";

const api = new APIClient("/bookings");

export function useBookingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn(data: BookingRequestData) {
      const response = await api.post<Appointment, BookingRequestData>(
        undefined,
        data,
      );

      return response.data;
    },

    onSuccess(_, { doctorId }) {
      return Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["doctor", doctorId],
        }),

        queryClient.invalidateQueries({
          queryKey: ["auth", "me"],
        }),
      ]);
    },
  });
}

export function useUnbookingMutation() {
  const queryClient = useQueryClient();
  const api = new APIClient("/auth");

  return useMutation({
    mutationFn: ({
      appointmentId,
    }: {
      appointmentId: string;
      doctorId: string;
    }) => {
      return api.delete(`me/appointments/${appointmentId}`);
    },

    onSuccess(_, { doctorId }) {
      return Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["doctors", doctorId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["auth", "me"],
        }),
      ]);
    },
  });
}
