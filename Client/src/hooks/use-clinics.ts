import APIClient from "@/core/ApiClient";
import type { Clinic, GetAllClinicsResponse } from "@/types/http";
import { createQueryHook } from "./use-http";
import { clinicKeys, type ClinicFilters } from "./keys";

const api = new APIClient("/clinics");

export const useGetClinics = createQueryHook(
  (params: ClinicFilters) => clinicKeys.list(params),
  (params) =>
    api
      .get<GetAllClinicsResponse>(undefined, {
        params: {
          ...params,
        },
      })
      .then((res) => res.data),
);

export const useGetClinic = createQueryHook(
  (vars) => clinicKeys.detail(vars.id),
  (vars: { id: string }) => api.get<Clinic>(vars.id).then((res) => res.data),
);
