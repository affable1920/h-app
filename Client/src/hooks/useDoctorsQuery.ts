import { keepPreviousData, useQuery } from "@tanstack/react-query";
import APIClient from "@/services/ApiClient";
import type { operations } from "@/types/api";

type Params = operations["get_doctors"]["parameters"]["query"];
type DoctorResponse =
  operations["get_doctors"]["responses"]["200"]["content"]["application/json"];

const endpoint = "/doctors";
const api = new APIClient<DoctorResponse>(endpoint);

function useDoctorsQuery(params: Params) {
  return useQuery({
    queryKey: ["doctors", { ...params }],
    queryFn: async () => {
      try {
        const response = await api.get({
          params: { ...params },
        });

        return response;
      } catch (ex) {
        console.log(ex);
      }
    },
    placeholderData: keepPreviousData,
  });
}

export default useDoctorsQuery;
