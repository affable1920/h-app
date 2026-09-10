import { type components, type operations, type paths } from "./api";

export type BookingRequestData = components["schemas"]["BookingRequestData"];
export type Appointment = components["schemas"]["AppointmentResponse"];

export type GetAllDrResponse =
  paths["/doctors"]["get"]["responses"]["200"]["content"]["application/json"];
export type GetByIdResponse = components["schemas"]["DoctorHttpFull"];

export type GetAllClinicsResponse =
  paths["/clinics"]["get"]["responses"]["200"]["content"]["application/json"];

export type ValidationError = components["schemas"]["HTTPValidationError"];
export type PydanticValidationError = ValidationError["detail"];

export type Doctor = components["schemas"]["DoctorHttpMinimal"];
export type Status = components["schemas"]["Status"];

export type Slot = components["schemas"]["Slot"];
export type Clinic = components["schemas"]["ClinicHttpMinimal"];
export type Schedule = components["schemas"]["Schedule"];

export type ChatRequest =
  operations["stream_chat"]["requestBody"]["content"]["application/json"];
export type ServerParams = NonNullable<
  operations["get_doctors"]["parameters"]["query"]
>;

export type PatientCreate =
  operations["register_pt"]["requestBody"]["content"]["application/json"];
export type PatientLogin = components["schemas"]["PatientLogin"];
export type DoctorLogin = components["schemas"]["DoctorLogin"];
export type DoctorCreate =
  components["schemas"]["Body_register_dr_auth_register_doctor_post"];
export type UserResponse = components["schemas"]["UserResponse"];
export type ScheduleCreate = components["schemas"]["CreateSchedule"];
export type ScheduleResponse = components["schemas"]["ScheduleResponse"];

export type Role = "doctor" | "patient";

type ProfileResponseMap = {
  doctor: components["schemas"]["DrProfileResponse"];
  patient: components["schemas"]["PatientProfileResponse"];
};

export type ProfileResponse<R extends Role> = ProfileResponseMap[R];

export type APIError = {
  message: string;
  code: string; // the code recieved from the server, e.g. "Internal_Server_Error"
  status: number;
  ctx?: any;
  detail?: any;
};

// http utility functions
export function isPydanticError(error: any): error is PydanticValidationError {
  return (
    error &&
    Array.isArray(error) &&
    error.length > 0 &&
    "loc" in error[0] &&
    "msg" in error[0] &&
    "type" in error[0]
  );
}
