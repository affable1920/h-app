import { type components } from "./api";

export type UserLogin = components["schemas"]["LoginUser"];
export type UserCreate = components["schemas"]["CreateUser"];
export type UserDB = components["schemas"]["ResponseUser"];

export type BookingRequestData = components["schemas"]["BookingRequestData"];
export type Appointment = components["schemas"]["Appointment"];

export type GetAllDrResponse =
  components["schemas"]["PaginatedResponse_DoctorSummary_"];
export type GetByIdResponse = components["schemas"]["Doctor"];

export type ValidationError = components["schemas"]["HTTPValidationError"];
export type PydanticValidationError = ValidationError["detail"];

export type Doctor = components["schemas"]["Doctor"];
export type Status = components["schemas"]["Status"];
export type DoctorSummary = components["schemas"]["DoctorSummary"];

export type Slot = components["schemas"]["Slot"];
export type Clinic = components["schemas"]["Clinic"];
export type Schedule = components["schemas"]["Schedule"];

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
