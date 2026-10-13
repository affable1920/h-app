import type { components, operations, paths } from "./api";

export type GetAllDoctorsResponse =
  operations["get_doctors"]["responses"]["200"]["content"]["application/json"];

export type GetDoctorResponse =
  operations["get_doctor"]["responses"]["200"]["content"]["application/json"];

export type GetDoctorAppointmentsResponse =
  operations["get_appointments"]["responses"]["200"]["content"]["application/json"];

export type GetDoctorSchedulesResponse =
  operations["get_schedules"]["responses"]["200"]["content"]["application/json"];

export type GetDoctorClinicsResponse =
  paths["/doctors/me/clinics"]["get"]["responses"]["200"]["content"]["application/json"];

export type PaginationParams =
  operations["get_appointments"]["parameters"]["query"];

export type DoctorHttpMinimal = components["schemas"]["DoctorHttpMinimal"];

export type DoctorLogin = components["schemas"]["DoctorLogin"];
export type DoctorCreate =
  components["schemas"]["Body_register_dr_auth_register_doctor_post"];

export type DoctorAvailabilityStatus = NonNullable<DoctorHttpMinimal["status"]>;

export type DoctorProfile = components["schemas"]["DrProfileResponse"];
