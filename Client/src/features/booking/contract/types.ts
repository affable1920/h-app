import type { operations } from "@/types/api";

export type BookingSchema =
  operations["book"]["requestBody"]["content"]["application/json"];

export type BookingResponse =
  operations["book"]["responses"]["200"]["content"]["application/json"];
