import { QueryClient, useMutation } from "@tanstack/react-query";

import APIClient from "@/services/ApiClient";
import type { Appointment, BookingRequestData } from "@/types/http";

const api = new APIClient("/doctors");
const queryClient = new QueryClient();

export function useBookingMutation(doctorId: string) {
  return useMutation({
    mutationFn: async (data: BookingRequestData) => {
      const response = await api.post<Appointment, BookingRequestData>(
        doctorId,
        data,
      );
      return response.data;
    },

    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: [
          ["doctor", doctorId],
          ["auth", "me"],
        ],
      });
    },
  });
}

export function useUnbookingMutation() {
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
