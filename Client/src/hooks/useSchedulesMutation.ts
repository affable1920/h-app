import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { operations } from "@/types/api";
import drService from "@/services/DoctorService";

type BookScheduleData =
  operations["book_schedule"]["requestBody"]["content"]["application/json"];

export default function useSchedulesMutation(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BookScheduleData) =>
      await drService.schedule(id, data),

    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ["doctor", id] });
    },
  });
}
