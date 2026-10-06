import type { PaginationParams } from "@/types/doctor-api";

export const doctorScheduleKeys = {
  all: ["me", "schedules"] as const,
  list: (filters: PaginationParams) =>
    [...doctorScheduleKeys.all, filters] as const,
  one: (scheduleId: string) => [...doctorScheduleKeys.all, scheduleId] as const,
};
