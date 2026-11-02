import type { components, operations, paths } from "./api";

export type AppointmentPatientResponse =
  components["schemas"]["AppointmentPatientResponse"];

export type AppointmentDoctorResponse =
  components["schemas"]["AppointmentDoctorResponse"];

export type AppointmentStatus = AppointmentPatientResponse["status"];

export type GetDoctorAppointmentsResponse =
  operations["get_appointments"]["responses"]["200"]["content"]["application/json"];

export type GetDoctorAppointmentsParams =
  paths["/doctors/me/appointments"]["get"]["parameters"]["query"];

export type GetPatientAppointmentsParams =
  paths["/patients/me/appointments"]["get"]["parameters"]["query"];
