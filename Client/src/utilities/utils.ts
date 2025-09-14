import type { AxiosResponse } from "axios";

export const paginate = <T>(
  items: T[] = [],
  currPage: number = 1,
  max: number = 10
): T[] => {
  if (!Array.isArray(items) || items.length === 0) return [];

  const start = (currPage - 1) * max;
  const end = start + max;

  return items.slice(start, end);
};

export const filter = <T extends { name: string }>(
  items: T[] = [],
  sq?: string
): T[] => {
  if (!sq) return items;
  const sqNormalized = sq.toLowerCase().trim();
  return items.filter((item) =>
    item.name.toLowerCase().trim().includes(sqNormalized)
  );
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function exponentialBackoff(
  func: () => Promise<AxiosResponse | void>,
  maxRetries: number = 3
) {
  // config for exp backoff
  const callId = Math.random().toString(36).substring(2, 8);
  console.log(`[${callId}] Starting exponential backoff`);

  let attempt = 1;

  while (attempt <= maxRetries) {
    try {
      console.log("Exec attempt", attempt);
      return await func();
    } catch (ex) {
      if (attempt === maxRetries) {
        console.log("All attempts failed.");
        throw ex;
      }

      console.log(`Attempt ${attempt} failed with the below error\n ${ex}`);
      attempt += 1;

      const delay = attempt * 1000 + Math.random() * 1000;
      console.log("Re-Attempting in ", delay, "ms");

      await sleep(delay);
    }
  }
  console.log("All attempts failed !");
}
