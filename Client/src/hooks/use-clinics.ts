import APIClient from "@/core/ApiClient";
import type { Clinic, GetAllClinicsResponse } from "@/types/http";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useLocation, useSearchParams } from "react-router-dom";

const api = new APIClient("/clinics");

export function useGetAll() {
  const [params] = useSearchParams();
  const queryParams = Object.fromEntries(params.entries());

  const route = useLocation().pathname.split("/").at(-1) ?? "clinics";

  return useQuery({
    queryKey: ["clinics", { ...queryParams }],
    async queryFn() {
      const response = await api.get<GetAllClinicsResponse>(undefined, {
        params: { ...queryParams },
      });

      return response.data;
    },

    placeholderData: keepPreviousData,
    enabled: route === "clinics",
  });
}

export function getById(id: string) {
  return useQuery({
    queryKey: ["clinic", id],
    async queryFn() {
      const response = await api.get<Clinic>(id);
      return response.data;
    },
  });
}
