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
    queryFn: async () => {
      try {
        const response = await drService.getAll(params);
        console.log("doctors endpoint response: ", response);

        return response;
      } catch (ex) {
        console.log(ex);
      }
    },
    placeholderData: keepPreviousData,
  });
}
