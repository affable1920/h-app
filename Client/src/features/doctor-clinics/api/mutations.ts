import APIClient from "@/core/ApiClient";
import { doctorKeys } from "@/hooks/keys";
import { createMutationHook } from "@/hooks/use-http";
import type { GetDoctorClinicsResponse } from "@/types/doctor-api";

const api = new APIClient("/doctors");

type DoctorClinic = GetDoctorClinicsResponse["entities"][number];

export const useAssociateDoctorClinic = createMutationHook<
  { clinicId: string },
  DoctorClinic
>(
  (vars) =>
    api
      .put(`me/clinics/${vars.clinicId}`, undefined)
      .then((res) => res.data as DoctorClinic),
  () => [doctorKeys.relations("clinics")],
);
