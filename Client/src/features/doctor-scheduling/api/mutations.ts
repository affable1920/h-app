import type { ScheduleResponse } from "@/types/http";
import { doctorKeys } from "../../../hooks/keys";
import { createMutationHook } from "../../../hooks/use-http";
import APIClient from "@/core/ApiClient";

import { type ScheduleCreate } from "@/features/doctor-scheduling/contract/create-schema";
import { doctorScheduleKeys } from "./keys";

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

export const useUpdateSchedule = createMutationHook(
  ({
    id,
    changes,
  }: {
    doctorId: string;
    id: string;
    changes: { q: string; val: unknown };
  }) =>
    api.put(
      id,
      {
        val: changes.val,
      },
      {
        params: {
          q: changes.q,
        },
      },
    ),
  (vars) => [doctorKeys.details(vars.doctorId), doctorScheduleKeys.all],
);

export const useDeleteSchedule = createMutationHook(
  ({ id }: { id: string; doctorId: string }) => api.delete(id),
  ({ doctorId }) => [doctorKeys.details(doctorId), doctorScheduleKeys.all],
);
