import type { components, operations } from "./api";

export type GetPatientAppointmentsResponse =
  components["schemas"]["PaginatedResponse_AppointmentPatientResponse_"];

export type PatientCreate =
  operations["register_pt"]["requestBody"]["content"]["application/json"];

export type PatientLogin = components["schemas"]["PatientLogin"];

export type PatientProfile = components["schemas"]["PatientProfileResponse"];
