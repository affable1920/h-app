import { useMutation } from "@tanstack/react-query";

import drService from "@/services/DoctorService";
import { getIds } from "@/stores/scheduleStore";

type PatientData = {
  patientName: string;
  patientContact: string;
};

const targets = ["selectedClinic", "selectedSchedule", "selectedSlot"] as const;

export default function useSchedulesMutation(id: string) {
  const ids = getIds<(typeof targets)[number]>(new Set(targets));

  return useMutation({
    mutationKey: ["doctor", id, "schedules"],

    async mutationFn({ patientData }: { patientData: PatientData }) {
      return await drService.schedule(id, {
        ...patientData,
        slotId: ids.selectedSlot,
        clinicId: ids.selectedClinic,
        scheduleId: ids.selectedSchedule,
      });
    },
  });
}
