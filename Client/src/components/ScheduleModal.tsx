import React from "react";
import { DateTime } from "luxon";
import type { Doctor, Slot } from "@/types/doctorAPI";

type ScheduleContext = {
  tagline: string;
  slotsLeft: number;
  nearestSlot: Slot;
  nextAvailable: Date;
  isAvailableTomorrow: boolean;
};

interface ScheduleModalProps {
  doctor: Doctor;
  context: ScheduleContext;
}

const ScheduleModal = ({ doctor, context }: ScheduleModalProps) => {
  return (
    <div>
      <h2 className="card-h2">{context.tagline}</h2>
    </div>
  );
};

export default ScheduleModal;
