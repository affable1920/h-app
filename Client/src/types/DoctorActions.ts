import { type Status } from "./doctorAPI";

// Define a const for all actions (functions) to be on a doctor
// keep adding as the app grows
export const ACTIONS = [
  "call",
  "schedule",
  "message",
  "profile",
  "book",
] as const;

export type DoctorActionSignature = (
  target?: EventTarget & HTMLButtonElement
) => void;

// typeof ACTION[number] works for arrays, think of the typeof ARRAY[number] as a way to get an
// array element using it's index
export type ActionNames = (typeof ACTIONS)[number];

// Use this later for type safe access of available actions for any doctor based on his status
// action name mapped to it's counterpart function signature
export type DoctorActions<T = Status> = T extends "available"
  ? {
      call: DoctorActionSignature;
      schedule: DoctorActionSignature;
    }
  : T extends "busy"
  ? {
      schedule: DoctorActionSignature;
      message: DoctorActionSignature;
    }
  : {
      profile: DoctorActionSignature;
      message: DoctorActionSignature;
    };

// an interface for a button's UI
export interface DrCTA {
  icon: string;
  label: string;

  // needs dropdown
  needsDD?: boolean;

  // isPrimary boolean for color config
  isPrimary?: boolean;

  name: ActionNames;
}
