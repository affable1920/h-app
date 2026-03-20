import { useMutation, useQueryClient } from "@tanstack/react-query";

import APIClient from "@/services/ApiClient";
import type { Appointment, BookingRequestData } from "@/types/http";

const api = new APIClient("/doctors");

export function useBookingMutation(doctorId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn(data: BookingRequestData) {
      const response = await api.post<Appointment, BookingRequestData>(
        doctorId + "/book",
        data,
      );

      return response.data;
    },

    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: ["doctor", doctorId],
      });
    },
  });
}

export function useUnbookingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      appointmentId,
    }: {
      appointmentId: string;
      doctorId: string;
    }) => {
      console.log(
        "appointment cancellation rqst recieved for appointment with id: ",
        appointmentId,
      );

      return api.delete(`me/appointments/${appointmentId}`);
    },

    onSuccess(_, { appointmentId, doctorId }) {
      console.log("successfully deleted appointment with id: ", appointmentId);

      queryClient.invalidateQueries({
        queryKey: [
          ["auth", "me"],
          ["doctors", doctorId],
        ],
      });
    },
  });
}
