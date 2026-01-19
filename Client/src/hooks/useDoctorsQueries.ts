import { keepPreviousData, useQuery } from "@tanstack/react-query";

import type { paths } from "@/types/api";
import drService from "@/services/DoctorService";
import { useSearchParams } from "react-router-dom";

type Params = paths["/doctors"]["get"]["parameters"]["query"];

export default function useDoctorsQueries() {
  const [searchParams] = useSearchParams();
  const params: Params = Object.fromEntries(searchParams.entries());

  const getAll = () =>
    useQuery({
      queryKey: ["doctors", { ...params }],
      queryFn: () =>
        drService.getAll({ ...params }).then((response) => response),

      retry: 1,
      placeholderData: keepPreviousData,
    });

  const getById = (doctorId: string) =>
    useQuery({
      queryKey: ["doctor", doctorId],
      queryFn: () => drService.getById(doctorId),
      enabled: !!doctorId,
    });

  return { getAll, getById };
}
