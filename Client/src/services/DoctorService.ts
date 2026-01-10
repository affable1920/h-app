import { doctorApi } from "./ApiClient";
import { type operations } from "@/types/api";

type GetAllDrParams = operations["get_doctors"]["parameters"]["query"];

type GetAllDrResponse =
  operations["get_doctors"]["responses"]["200"]["content"]["application/json"];

type GetSingleDrResponse =
  operations["get_doctor"]["responses"]["200"]["content"]["application/json"];

type BookScheduleData =
  operations["book_schedule"]["requestBody"]["content"]["application/json"];

type BookScheduleResponse =
  operations["book_schedule"]["responses"]["200"]["content"]["application/json"];

class DoctorService {
  // Add error handling
  async getAll(params: GetAllDrParams): Promise<GetAllDrResponse> {
    const response = await doctorApi.get<GetAllDrResponse>(undefined, {
      params,
    });

    return response.data;
  }

  async getById(id: string): Promise<GetSingleDrResponse> {
    return (await doctorApi.get<GetSingleDrResponse>(id)).data;
  }

  async schedule(
    id: string,
    data: BookScheduleData
  ): Promise<BookScheduleResponse> {
    const slug = `${id}/book`;

    return (
      await doctorApi.post<BookScheduleResponse, BookScheduleData>(slug, data)
    ).data;
  }
}

// Use dependency injection pattern
const drService = new DoctorService();
export default drService;
