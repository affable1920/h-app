import type { components, operations, paths } from "./api";

export type GetPatientAppointmentsResponse =
  paths["/patients/me/appointments"]["get"]["responses"]["200"]["content"]["application/json"];

export type GetPatientAppointmentResponse =
  paths["/patients/me/appointments/{appointment_id}"]["get"]["responses"]["200"]["content"]["application/json"];

export type PatientCreate =
  operations["register_pt"]["requestBody"]["content"]["application/json"];

export type PatientLogin = components["schemas"]["PatientLogin"];

export type PatientProfile = components["schemas"]["PatientProfileResponse"];
