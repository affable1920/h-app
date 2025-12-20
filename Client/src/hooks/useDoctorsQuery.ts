import useQueryStore from "@/stores/queryStore";
import drService from "@/services/DoctorService";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export function useAllDoctors() {
  const { page, searchQuery } = useQueryStore();

  return useQuery({
    queryKey: ["doctors", page, searchQuery],
    async queryFn() {
      const response = await drService.getAll({ page, searchQuery });
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
