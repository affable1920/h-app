import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { operations } from "@/types/api";
import drService from "@/services/DoctorService";

type BookScheduleData =
  operations["book_schedule"]["requestBody"]["content"]["application/json"];

export default function useSchedulesMutation() {
  const queryClient = useQueryClient();

  const bookMutation = (doctorId: string) =>
    useMutation({
      mutationFn: (data: BookScheduleData) =>
        drService.schedule(doctorId, data),

      onSuccess() {
        queryClient.invalidateQueries({ queryKey: ["doctor", doctorId] });
      },
    });

  const unBookMutation = useMutation({
    mutationFn: (appId: string) => {
      console.log(appId);
    },
  });

  return { bookMutation, unBookMutation };
}
