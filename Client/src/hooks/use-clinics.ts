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
  (id?: string) => clinicKeys.details(id!),
  (id) => api.get<Clinic>(id).then((res) => res.data),
);
