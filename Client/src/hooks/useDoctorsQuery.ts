import { useCallback } from "react";
import type { operations } from "@/types/api";
import { useSearchParams } from "react-router-dom";

import drService from "@/services/DoctorService";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

type Params = operations["get_doctors"]["parameters"]["query"];

export function useAllDoctors() {
  const [searchParams, setSearchParams] = useSearchParams();

  const params: Params = Object.fromEntries(searchParams.entries());
  const queryKey = ["doctors", { ...params }];

  const handlePageChange = useCallback(
    function (direction: "next" | "prev") {
      const page = parseInt(searchParams.get?.("page") ?? "1");
      const nextPage = direction === "next" ? page + 1 : page - 1;

      setSearchParams((p) => ({ ...p, page: nextPage.toString() }));
    },
    [searchParams, setSearchParams]
  );

  return {
    ...useQuery({
      queryKey,
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
    }),
    handlePageChange,
  };
}
