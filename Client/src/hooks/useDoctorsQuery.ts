import drService from "@/services/DoctorService";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import type { paths } from "@/types/api";

type Params = paths["/doctors"]["get"]["parameters"]["query"];

export function useAllDoctors() {
  const [searchParams] = useSearchParams();
  const params: Params = Object.fromEntries(searchParams.entries());

  return useQuery({
    queryKey: ["doctors", { ...params }],
    async queryFn() {
      const response = await drService.getAll({ ...params });
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
      const recievedDr = await drService.getById(id);
      console.log("Recieved Dr ", recievedDr);

      return recievedDr;
    },

    enabled: !!id,
  });
}
