import type { components } from "./api";

export type ValidationError = components["schemas"]["HTTPValidationError"];
export type PydanticValidationError = ValidationError["detail"];

export type APIError = {
  // Normalized error type for our frontend
  msg: string;
  status: number;
  type: string;
  detail: any;
  ctx?: any;
};

// Type guard function using the utility type

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
