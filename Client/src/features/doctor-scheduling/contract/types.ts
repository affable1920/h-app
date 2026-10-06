import type { operations } from "@/types/api";

export type GetDoctorSchedules =
  operations["get_schedules"]["responses"]["200"]["content"]["application/json"];
