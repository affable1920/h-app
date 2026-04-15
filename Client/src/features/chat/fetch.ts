import { config } from "@/config";

async function makeRequest(
  token: string,
  input: unknown,
  signal?: AbortSignal,
) {
  const response = await fetch(config.api_url + "/chat", {
    method: "POST",

    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },

    signal: signal,
    body: JSON.stringify(input),
  });

  return response;
}

export { makeRequest };
