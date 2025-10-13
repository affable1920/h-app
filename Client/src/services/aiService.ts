import type { AxiosResponse } from "axios";
import api from "../services/ApiClient";

const endpoint = "/chat";

export default async function sendMsg(
  msg: string
): Promise<AxiosResponse["data"]> {
  const response = await api.post(endpoint, { msg });
  // return response.data;
}
