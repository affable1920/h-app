import { DateTime } from "luxon";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface StoreState {
  selectedDate: DateTime | null;
  selectedSlot: string | null;
  selectedClinic: string | null;
}

interface Actions {
  setSelectedDate: (date: DateTime) => void;
}

const useScheduleStore = create<StoreState & Actions>()(
  persist(
    (set, get) => ({
      selectedDate: DateTime.local(),
      selectedClinic: null,
      selectedSlot: null,

      setSelectedDate: (date) => {
        set({
          ...get(),
          selectedDate: get().selectedDate?.day === date.day ? null : date,
        });
      },
    }),
    {
      name: "schedules-store",
      partialize(state) {
        return state;
      },
    }
  )
);

export default useScheduleStore;
