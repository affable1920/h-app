import {
  keepPreviousData,
  useQuery,
  type UseQueryResult,
} from "@tanstack/react-query";

import APIClient from "@/services/ApiClient";
import type { operations } from "@/types/api";
import { useSearchParams } from "react-router-dom";
import type { GetAllDrResponse, GetByIdResponse } from "@/types/http";

const api = new APIClient("/doctors");
type GetAllDrParams = operations["get_doctors"]["parameters"]["query"];

export function useGetAll(): UseQueryResult<GetAllDrResponse> {
  const [searchParams] = useSearchParams();
  const params: GetAllDrParams = Object.fromEntries(searchParams.entries());

  return useQuery<GetAllDrResponse>({
    queryKey: ["doctors", { ...params }],
    async queryFn() {
      const response = await api.get<GetAllDrResponse>(undefined, {
        params,
      });

      return response.data;
    },

    retry: 1,
    placeholderData: keepPreviousData,
  });
}

export function useGetById(id: string): UseQueryResult<GetByIdResponse> {
  return useQuery({
    queryKey: ["doctors", id],
    queryFn: async () => {
      return (await api.get<GetByIdResponse>(id)).data;
    },
  });
}
