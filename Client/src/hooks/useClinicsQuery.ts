import { useQuery } from "@tanstack/react-query";
import api from "@services/ApiClient";
import type { operations } from "@/types/api";

type ClinicsResponse =
  operations["get_clinics"]["responses"]["200"]["content"]["application/json"];

const endpoint = "/clinics";

function useClinicsQuery() {
  return useQuery({
    queryKey: ["clinics"],
    queryFn: async () => {
      try {
        const response = await api.get<ClinicsResponse>(endpoint);
        return response.data;
      } catch (ex) {
        console.log(ex);
      }
    },
  });
}

export default useClinicsQuery;
