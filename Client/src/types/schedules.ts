import type { components, operations } from "./api";

export type Schedule = components["schemas"]["Schedule"];
export type ScheduleCreate =
  operations["create_schedule"]["requestBody"]["content"]["application/json"];
export type ScheduleCreateResponse =
  operations["create_schedule"]["responses"]["201"]["content"]["application/json"];
export type Slot = components["schemas"]["Slot"];
export type Clinic = components["schemas"]["ClinicHttpMinimal"];

export type DoctorScheduleResponse =
  components["schemas"]["DoctorScheduleResponse"];
