import type { components } from "./api";

// essentials has just the required properties for rendering
export type DoctorEssentials = components["schemas"]["DoctorSummary"];

// Full dr including schedules, slots etc ...
export type Doctor = components["schemas"]["Doctor"];

export type Status = DoctorEssentials["status"];

export type Clinic = components["schemas"]["Clinic"];

export type Fee = components["schemas"]["Fee"];
export type Slot = components["schemas"]["Slot"];

export type Location = components["schemas"]["Location"];
export type Schedule = components["schemas"]["Schedule"];
