async function request(
  url: string,
  token: string,
  requestBody: unknown,
  signal?: AbortSignal,
) {
  return await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    signal,
    body: JSON.stringify(requestBody),
  });
}

export { request };
