import { useQuery } from "@tanstack/react-query";
import APIClient from "@services/ApiClient";
import type { operations } from "@/types/api";

type ClinicsResponse =
  operations["get_clinics"]["responses"]["200"]["content"]["application/json"];

const endpoint = "/clinics";
const api = new APIClient(endpoint);

function useClinicsQuery() {
  return useQuery({
    queryKey: ["clinics"],
    queryFn: async () => {
      try {
        const response = await api.get();
        return response.data;
      } catch (ex) {
        console.log(ex);
      }
    },
  });
}

export default useClinicsQuery;
