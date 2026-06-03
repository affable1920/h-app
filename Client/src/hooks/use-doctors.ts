import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useLocation, useSearchParams } from "react-router-dom";
import APIClient from "@/services/ApiClient";
import type { operations } from "@/types/api";
import type { GetByIdResponse, GetAllDrResponse } from "@/types/http";

const api = new APIClient("/doctors");
type GetAllDrParams = operations["get_doctors"]["parameters"]["query"];

export function useGetAll() {
  const [searchParams] = useSearchParams();
  const queryParams: GetAllDrParams = Object.fromEntries(
    searchParams.entries(),
  );

  const route = useLocation().pathname.split("/").at(-1) ?? "doctors";

  return useQuery({
    queryKey: ["doctors", { ...queryParams }],

    async queryFn() {
      const response = await api.get<GetAllDrResponse>(undefined, {
        params: { ...queryParams },
      });

      return response.data;
    },

    placeholderData: keepPreviousData,
    enabled: route === "doctors",
  });
}

export function useGetById(id: string) {
  return useQuery({
    queryKey: ["doctor", id],
    async queryFn() {
      const response = await api.get<GetByIdResponse>(id);
      return response.data;
    },
  });
}
