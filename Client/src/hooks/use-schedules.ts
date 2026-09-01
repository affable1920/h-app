import type { ScheduleCreate } from "@/schemas";
import type { ScheduleResponse } from "@/types/http";
import { doctorKeys } from "./keys";
import { createMutationHook } from "./use-http";
import APIClient from "@/core/ApiClient";

const api = new APIClient("/schedules");

export const useCreateSchedule = createMutationHook<
  { payload: ScheduleCreate; doctorId: string },
  ScheduleResponse
>(
  ({ payload }) =>
    api
      .post<ScheduleResponse, ScheduleCreate>("create", payload)
      .then((res) => res.data),
  (vars) => [doctorKeys.auth(), doctorKeys.detail(vars.doctorId)],
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
  (vars) => [doctorKeys.detail(vars.doctorId), doctorKeys.auth()],
);

export const useDeleteSchedule = createMutationHook(
  ({ id }: { id: string; doctorId: string }) => api.delete(id),
  ({ doctorId }) => [doctorKeys.detail(doctorId), doctorKeys.auth()],
);
