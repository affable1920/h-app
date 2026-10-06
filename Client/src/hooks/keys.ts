import type { operations } from "@/types/api";
import type { PaginationParams } from "@/types/doctor-api";

export type DoctorFilters = operations["get_doctors"]["parameters"]["query"];
export type ClinicFilters = operations["get_clinics"]["parameters"]["query"];

export const doctorKeys = {
  all: ["doctors"] as const, // all entities - no pagination, filtering or sorting
  list: (filters: DoctorFilters) => [...doctorKeys.all, filters] as const,
  details: (id: string) => [...doctorKeys.all, id] as const,
  auth: ["auth", "me"], // doctor profile
  relations: (
    rel: string,
    filters?: PaginationParams, // doctor's relationships with basic pagination
  ) => (filters ? (["me", rel, filters] as const) : (["me", rel] as const)),
  relation: (rel: string, id: string) => [...doctorKeys.relations(rel), id], // a single doctor relationship record
};

export const clinicKeys = {
  all: ["clinics"] as const,
  list: (filters: ClinicFilters) => [...clinicKeys.all, filters] as const,
  details: (id: string) => [...clinicKeys.all, id] as const,
};
