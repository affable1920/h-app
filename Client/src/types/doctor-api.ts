import type { operations } from "./api";

export type GetAllDoctorsResponse =
  operations["get_doctors"]["responses"]["200"]["content"]["application/json"];
export type GetDoctorResponse =
  operations["get_doctor"]["responses"]["200"]["content"]["application/json"];
export type GetDoctorAppointmentsResponse =
  operations["get_appointments"]["responses"]["200"]["content"]["application/json"];
export type GetDoctorSchedulesResponse =
  operations["get_schedules"]["responses"]["200"]["content"]["application/json"];
