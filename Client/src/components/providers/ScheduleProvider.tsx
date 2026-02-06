import React, { useMemo } from "react";

import { DateTime } from "luxon";
import type { Clinic, Schedule, Slot } from "@/types/http";

interface ScheduleState {
  day: number | null;
  slot: Slot | null;
  clinic: Clinic | null;
  date: DateTime | null;
  schedule: Schedule | null;
}

type ScheduleAction =
  | { type: "SET_SLOT"; payload: Slot }
  | { type: "SET_CLINIC"; payload: Clinic }
  | { type: "SET_DAY"; payload: number }
  | { type: "SET_DATE"; payload: DateTime }
  | { type: "SET_SCHEDULE"; payload: Schedule }
  | { type: "CLEAR_FIELD"; payload: keyof ScheduleState }
  | { type: "RESET" }
  | { type: "SET"; payload: { key: keyof ScheduleState; val: any } };

const init: ScheduleState = {
  day: null,
  slot: null,
  clinic: null,
  date: null,
  schedule: null,
};

function reducer(state: ScheduleState, action: ScheduleAction) {
  switch (action.type) {
    case "SET_CLINIC":
      return {
        ...state,
        clinic: state.clinic?.id === action.payload.id ? null : action.payload,
      };

    case "SET_DATE":
      return {
        ...state,
        date: state.date?.startOf("day").equals(action.payload.startOf("day"))
          ? null
          : action.payload,
      };

    case "SET_DAY":
      return {
        ...state,
        day: state.day === action.payload ? null : action.payload,
      };

    case "SET_SLOT":
      return {
        ...state,
        slot: state.slot?.id === action.payload.id ? null : action.payload,
      };

    case "SET_SCHEDULE":
      return {
        ...state,
        schedule:
          state.schedule?.id === action.payload.id ? null : action.payload,
      };

    case "CLEAR_FIELD":
      return { ...state, [action.payload]: null };

    case "RESET":
      return init;

    case "SET":
      return { ...state, [action.payload.key]: action.payload.val };
  }
}

type ScheduleContextType = {
  state: ScheduleState;
  actions: {
    setSlot: (slot: Slot) => void;
    setClinic: (clinic: Clinic) => void;
    setDay: (day: number) => void;
    setDate: (date: DateTime) => void;
    setSchedule: (schedule: Schedule) => void;
    clearField: (field: keyof ScheduleState) => void;
    reset: () => void;
    set: <K extends keyof ScheduleState>(key: K, val: ScheduleState[K]) => void;
  };
};

const ScheduleContext = React.createContext<ScheduleContextType | null>(null);

export const ScheduleProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = React.useReducer(reducer, init);

  const actions = React.useMemo(
    () => ({
      setSchedule: (schedule: Schedule) =>
        dispatch({ type: "SET_SCHEDULE", payload: schedule }),
      setSlot: (slot: Slot) => dispatch({ type: "SET_SLOT", payload: slot }),
      setClinic: (clinic: Clinic) =>
        dispatch({ type: "SET_CLINIC", payload: clinic }),
      setDay: (day: number) => dispatch({ type: "SET_DAY", payload: day }),
      setDate: (date: DateTime) =>
        dispatch({ type: "SET_DATE", payload: date }),
      clearField: (field: keyof ScheduleState) =>
        dispatch({ type: "CLEAR_FIELD", payload: field }),
      reset: () => dispatch({ type: "RESET" }),

      set: <K extends keyof ScheduleState>(key: K, val: ScheduleState[K]) =>
        dispatch({ type: "SET", payload: { key, val } }),
    }),
    [],
  );

  const contextVal = useMemo(() => ({ state, actions }), [state, actions]);

  return (
    <ScheduleContext.Provider value={contextVal}>
      {children}
    </ScheduleContext.Provider>
  );
};

export const useSchedule = () => {
  const context = React.useContext(ScheduleContext);

  if (!context) {
    throw new Error("useSchedule must be used within a ScheduleProvider");
  }

  return context;
};
