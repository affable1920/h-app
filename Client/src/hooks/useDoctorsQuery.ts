import { keepPreviousData, useQuery } from "@tanstack/react-query";
import APIClient from "@/services/ApiClient";
import type { operations } from "@/types/api";

type GetDoctorParams = operations["get_doctor"]["parameters"]["path"];
type GetDoctorsParams = operations["get_doctors"]["parameters"]["query"];

type Params = GetDoctorParams | (GetDoctorsParams & { id?: never });

type DoctorResponse =
  operations["get_doctors"]["responses"]["200"]["content"]["application/json"];

const endpoint = "/doctors";
const api = new APIClient<DoctorResponse>(endpoint);

function useDoctorsQuery(params: Params) {
  const queryKey = params?.id
    ? ["doctors", "doctor", params.id]
    : ["doctors", { ...params }];

  return useQuery({
    queryKey,
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
