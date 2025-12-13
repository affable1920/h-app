import type { operations } from "@/types/api";
import { useSearchParams } from "react-router-dom";

import drService from "@/services/DoctorService";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

type Params = operations["get_doctors"]["parameters"]["query"];

export function useAllDoctors() {
  const [searchParams] = useSearchParams();
  const params: Params = Object.fromEntries(searchParams.entries());

  return useQuery({
    queryKey: ["doctors", { ...params }],
    async queryFn() {
      const response = await drService.getAll(params);
      return response;
    },

    retry: 1,
    placeholderData: keepPreviousData,
  });
}

export function useDoctor(id: string) {
  return useQuery({
    queryKey: ["doctor", id],
    async queryFn() {
      return await drService.getById(id);
    },

    enabled: !!id,
  });
}
