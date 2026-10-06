import { createQueryHook } from "@/hooks/use-http";
import { doctorScheduleKeys } from "./keys";
import type { PaginationParams } from "@/types/doctor-api";
import type { GetDoctorSchedules } from "../contract/types";
import APIClient from "@/core/ApiClient";

const api = new APIClient("/doctors/me");

export const useGetDoctorSchedules = createQueryHook(
  (params) => doctorScheduleKeys.list(params),
  (params: PaginationParams) =>
    api
      .get<GetDoctorSchedules>(`schedules`, {
        params: {
          ...params,
        },
      })
      .then((res) => res.data),
);
