import { type components, type operations, type paths } from "./api";

export type BookingRequestData = components["schemas"]["BookingRequestData"];
export type Appointment = components["schemas"]["AppointmentResponse"];

export type GetAllDrResponse =
  paths["/doctors"]["get"]["responses"]["200"]["content"]["application/json"];
export type GetByIdResponse = components["schemas"]["Doctor"];

export type GetAllClinicsResponse =
  paths["/clinics"]["get"]["responses"]["200"]["content"]["application/json"];

export type ValidationError = components["schemas"]["HTTPValidationError"];
export type PydanticValidationError = ValidationError["detail"];

export type Doctor = components["schemas"]["Doctor"];
export type Status = components["schemas"]["Status"];

export type Slot = components["schemas"]["Slot"];
export type Clinic = components["schemas"]["Clinic"];
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
  components["schemas"]["Body_create_doctors_onboard_post"];
export type UserResponse = components["schemas"]["UserResponse"];

export type APIError = {
  msg: string;
  type: string;
  status: number;
  ctx?: any;
  detail: any;
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
