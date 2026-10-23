import type { components } from "./api";

export type AppointmentPatientResponse =
  components["schemas"]["AppointmentPatientResponse"];

export type AppointmentDoctorResponse =
  components["schemas"]["AppointmentDoctorResponse"];

export type AppointmentStatus = AppointmentPatientResponse["status"];
