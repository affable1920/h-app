import { create } from "zustand";
import { DateTime } from "luxon";
import type { Clinic, Schedule, Slot } from "@/types/doctorAPI";

type StoreState = {
  selectedDate: DateTime | null;
  selectedSlot: Slot | null;
  selectedClinic: Clinic | null;

  selectedSchedule?: Schedule | null;
};

interface Actions {
  setSelectedDate: (date: DateTime | null) => void;
  setSelectedSlot: (slotId: Slot) => void;
  setSelectedClinic: (clinicId: Clinic) => void;

  setSelectedSchedule: (scheduleId: Schedule) => void;
}

const useScheduleStore = create<StoreState & Actions>((set, get) => ({
  selectedDate: null,
  selectedSlot: null,
  selectedClinic: null,
  selectedSchedule: null,

  setSelectedDate(date) {
    set({
      ...get(),
      selectedDate:
        date === null || get().selectedDate?.equals(date) ? null : date,
    });
  },

  setSelectedSlot: (slot) => {
    set({
      ...get(),
      selectedSlot: get().selectedSlot === slot ? null : slot,
    });
  },

  setSelectedClinic: (clinic) => {
    set(() => ({ ...get(), selectedClinic: clinic }));
  },

  setSelectedSchedule(schedule) {
    set(() => ({ selectedSchedule: schedule }));
  },
}));

export function set<T extends keyof StoreState>(
  keyOrUpdates: Partial<keyof StoreState> | Record<T, StoreState[T]>,
  val?: StoreState[T]
) {
  // the fn takes either a single key and a val for that key
  // or multiple keys and vals as an object

  if (typeof keyOrUpdates === "string") {
    useScheduleStore.setState((prevStore) => ({
      ...prevStore,
      [keyOrUpdates]: val,
    }));
  } else {
    useScheduleStore.setState((prevStore) => ({
      ...prevStore,
      ...keyOrUpdates,
    }));
  }
}

type KeysWithId = Exclude<keyof StoreState, "selectedDate">;

export function getIds<T extends KeysWithId>(
  keyOrKeys: Set<T>
): { [K in T]: string } {
  const ids: { [K in T]: string } = {} as { [K in T]: string };

  for (const key of keyOrKeys) {
    const storeKey = useScheduleStore.getState()?.[key];

    if (storeKey?.["id"]) {
      ids[key] = storeKey["id"];
    }
  }

  return ids;
}

export default useScheduleStore;
