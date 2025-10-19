import type { AxiosResponse } from "axios";
import APIClient from "../services/ApiClient";

const endpoint = "/chat";
const api = new APIClient(endpoint);

export default async function sendMsg(
  msg: string
): Promise<AxiosResponse["data"]> {}
