import type { DateTime } from "luxon";
import type { DoctorEssentials, Slot } from "@/types/doctorAPI";

export function getSlotsLeft(doctor: DoctorEssentials, dt: DateTime): Slot[] {
  const targetSchedule = doctor.schedules.find(
    (s) => s.date === dt.toISODate()
  );

  console.log(doctor.schedules);

  const slotsLeft: Slot[] = [];

  for (const slot of targetSchedule?.slots ?? []) {
    if (!slot.booked) {
      slotsLeft.push(slot);
    }
  }

  return slotsLeft;
}
