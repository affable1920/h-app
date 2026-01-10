import type { components } from "./api";

// essentials has just the required properties for rendering
export type DoctorSummary = components["schemas"]["DoctorSummary"];

// Full dr including schedules, slots etc ...
export type Doctor = components["schemas"]["Doctor"];

export type Status = DoctorSummary["status"];

export type Clinic = components["schemas"]["Clinic"];

export type Slot = components["schemas"]["Slot"];
export type Schedule = components["schemas"]["Schedule"];
