import { DateTime } from "luxon";
import { create } from "zustand";
import type { TimeSlot } from "../types/DoctorInfo";
import type { Schedule } from "motion";

interface StoreState {
  selectedDate: DateTime | null;
  selectedSlot: TimeSlot | null;
  selectedClinic: string | null;

  selectedSchedule?: Schedule | null;
}

interface Actions {
  setSelectedDate: (date: DateTime) => void;
  setSelectedSlot: (slot: TimeSlot) => void;
  setSelectedClinic: (clinicId: string) => void;

  setSelectedSchedule?: (schedule: Schedule) => void;
}

const useScheduleStore = create<StoreState & Actions>((set, get) => ({
  selectedDate: DateTime.local(),
  selectedClinic: null,
  selectedSlot: null,

  setSelectedDate: (date) => {
    set({
      ...get(),
      selectedDate: get().selectedDate?.equals(date) ? null : date,
    });
  },
  setSelectedSlot: (slot) => {
    set({
      ...get(),
      selectedSlot: get().selectedSlot === slot ? null : slot,
    });
  },

  setSelectedClinic: (clinicId) => {
    set((store) => ({ ...store, selectedClinic: clinicId }));
  },

  setSelectedSchedule(schedule) {
    set(() => ({ selectedSchedule: schedule }));
  },
}));

export default useScheduleStore;
