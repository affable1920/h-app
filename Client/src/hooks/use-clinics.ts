import APIClient from "@/core/ApiClient";
import type { Clinic } from "@/types/http";
import { createQueryHook } from "./use-http";
import { clinicKeys, type ClinicFilters } from "./keys";
import type { paths } from "@/types/api";

export type GetAllClinicsResponse =
  paths["/clinics"]["get"]["responses"]["200"]["content"]["application/json"];

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
