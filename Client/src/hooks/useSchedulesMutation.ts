import { useMutation } from "@tanstack/react-query";

import drService from "@/services/DoctorService";
import { useSchedule } from "@/components/providers/ScheduleProvider";

type PatientData = {
  patientName: string;
  patientContact: string;
};

const targets = ["selectedClinic", "selectedSchedule", "selectedSlot"] as const;

export default function useSchedulesMutation(id: string) {
  const {
    state: { schedule, slot, clinic },
  } = useSchedule();

  return useMutation({
    mutationKey: ["doctor", id, "schedules"],

    async mutationFn({ patientData }: { patientData: PatientData }) {
      return await drService.schedule(id, {
        ...patientData,
        slotId: slot?.id as string,
        clinicId: clinic?.id as string,
        scheduleId: schedule?.id as string,
      });
    },
  });
}
