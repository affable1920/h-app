import type { operations } from "@/types/api";

export type DoctorFilters = operations["get_doctors"]["parameters"]["query"];
export type ClinicFilters = operations["get_all"]["parameters"]["query"];

export const doctorKeys = {
  all: ["doctors"] as const, // all entities - no pagination, filtering or sorting
  lists: () => [...doctorKeys.all, "list"] as const,
  list: (filters: DoctorFilters) => [...doctorKeys.lists(), filters] as const,
  details: () => [...doctorKeys.all, "detail"] as const,
  detail: (id: string) => [...doctorKeys.details(), id] as const,
  auth: () => ["auth", "me"],
};

export const clinicKeys = {
  all: ["clinics"] as const,
  lists: () => [...clinicKeys.all, "list"] as const,
  list: (filters: ClinicFilters) => [...clinicKeys.lists(), filters] as const,
  details: () => [...clinicKeys.all, "detail"] as const,
  detail: (id: string) => [...clinicKeys.details(), id] as const,
};
