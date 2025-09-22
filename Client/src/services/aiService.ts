import type { AxiosResponse } from "axios";
import api from "../utilities/api";

const endpoint = "/chat";

export default async function sendMsg(
  msg: string
): Promise<AxiosResponse["data"]> {
  const response = await api.post(endpoint, { msg });
  return response.data;
}
