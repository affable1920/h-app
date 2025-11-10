import type { components } from "./api";

export type Doctor = components["schemas"]["Doctor"];
export type Status = Doctor["status"];

export type Clinic = components["schemas"]["Clinic"];

export type Fee = components["schemas"]["Fee"];
export type Slot = components["schemas"]["Slot"];
export type Location = components["schemas"]["Location"];
export type Schedule = components["schemas"]["Schedule"];
