import { useMutation } from "@tanstack/react-query";

import type { operations } from "@/types/api";
import { getIds } from "@/stores/scheduleStore";
import drService from "@/services/DoctorService";

type BookScheduleData =
  operations["book_schedule"]["requestBody"]["content"]["application/json"];

type SchedulingData = {
  id: string;
  patientDetails: { patientName: string; patientContact: string };
};

const targets = ["selectedClinic", "selectedSchedule", "selectedSlot"] as const;

export default function useSchedulesMutation() {
  const ids = getIds<(typeof targets)[number]>(new Set(targets));
  const { selectedClinic, selectedSchedule, selectedSlot } = ids;

  return useMutation({
    mutationKey: ["schedules", ...Object.values(ids)],

    mutationFn: async ({ id, patientDetails }: SchedulingData) => {
      const data: BookScheduleData = {
        ...patientDetails,
        slotId: selectedSlot,
        clinicId: selectedClinic,
        scheduleId: selectedSchedule,
      };

      await drService.schedule(id, data);
    },
  });
}
