import type { operations } from "@/types/api";

export type DoctorFilters = operations["get_doctors"]["parameters"]["query"];

export const doctorKeys = {
  all: ["doctors"] as const,
  lists: () => [...doctorKeys.all, "list"] as const,
  list: (filters: DoctorFilters) => [...doctorKeys.lists(), filters] as const,
  details: () => [...doctorKeys.all, "detail"] as const,
  detail: (id: string) => [...doctorKeys.details(), id] as const,
  auth: () => ["auth", "me"],
};
