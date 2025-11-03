import { keepPreviousData, useQuery } from "@tanstack/react-query";
import drService from "@/services/DoctorService";
import type { operations } from "@/types/api";

type Params = operations["get_doctors"]["parameters"]["query"];

export function useAllDoctors(params: Params) {
  const queryKey = ["doctors", { ...params }];

  return useQuery({
    queryKey,
    queryFn: async () => {
      try {
        const response = await drService.getAll(params);

        return response;
      } catch (ex) {
        console.log(ex);
      }
    },
    placeholderData: keepPreviousData,
  });
}

export function useSingleDoctor(id: string) {
  return useQuery({
    queryKey: ["doctors", id],
    async queryFn() {
      try {
        return await drService.getById(id);
      } catch (ex) {
        console.log(ex);
      }
    },
  });
}
