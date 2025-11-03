import APIClient from "./ApiClient";
import type { operations } from "@/types/api";

type SingleDoctorParams = operations["get_doctor"]["parameters"]["path"];

type GetAllParams = operations["get_doctors"]["parameters"]["query"];

type GetAllDoctorsResponse =
  operations["get_doctors"]["responses"]["200"]["content"]["application/json"];

type GetSingleDoctorResponse =
  operations["get_doctor"]["responses"]["200"]["content"]["application/json"];

class DoctorService {
  private _endpoint: string = "/doctors";
  private _apiClient: APIClient;

  constructor() {
    this._apiClient = new APIClient(this._endpoint);
  }

  async getAll(params: GetAllParams): Promise<GetAllDoctorsResponse> {
    return (
      await this._apiClient.get<GetAllDoctorsResponse>({
        params: { ...params },
      })
    ).data;
  }

  async getById(
    id: SingleDoctorParams["id"]
  ): Promise<GetSingleDoctorResponse> {
    return (
      await this._apiClient.get<GetSingleDoctorResponse>({ params: { id } })
    ).data;
  }
}

const drService = new DoctorService();
export default drService;
