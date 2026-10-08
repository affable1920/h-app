import APIClient from "@/core/ApiClient";
import { doctorKeys } from "@hooks/keys";
import { createMutationHook } from "@hooks/use-http";
import type { ScheduleResponse } from "@/types/http";

import { doctorScheduleKeys } from "./keys";
import { type ScheduleCreate } from "@/features/doctor-scheduling/contract/create-schema";

const api = new APIClient("/schedules");

export const useCreateSchedule = createMutationHook<
  { payload: ScheduleCreate; doctorId: string },
  ScheduleResponse
>(
  ({ payload }) =>
    api
      .post<ScheduleResponse, ScheduleCreate>(undefined, payload)
      .then((res) => res.data),
  (vars) => [doctorScheduleKeys.all, doctorKeys.details(vars.doctorId)],
);

export const useSetScheduleActivation = createMutationHook(
  ({ id, isActive }: { doctorId: string; id: string; isActive: boolean }) =>
    api.patch<void, { isActive: boolean }>(`${id}/activation`, {
      isActive,
    }),
  (vars) => [doctorKeys.details(vars.doctorId), doctorScheduleKeys.all],
);

export const useDeleteSchedule = createMutationHook(
  ({ id }: { id: string; doctorId: string }) => api.delete<void>(id),
  ({ doctorId }) => [doctorKeys.details(doctorId), doctorScheduleKeys.all],
);
