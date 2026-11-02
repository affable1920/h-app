import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function debounce<Args extends Array<unknown>>(
  fn: (...args: Args) => void,
  ms: number = 200,
) {
  let timeoutId: ReturnType<typeof setTimeout>;

  function cancel() {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }

  function debounced(...args: Args) {
    cancel();

    timeoutId = setTimeout(function () {
      fn(...args);
    }, ms);
  }

  return {
    cancel,
    debounced,
  };
}

export function paginate<T>(
  list: Array<T> = [],
  iter: number = 1,
  max: number = 5,
) {
  const itemCount = list.length;

  const start = (iter - 1) * max;
  const limit = Math.min(itemCount, start + max);

  return list.slice(start, limit);
}

export function parseNumberParam(
  searchParams: URLSearchParams,
  key: string,
  defaultValue: number,
) {
  const value = searchParams.get(key);
  return value !== "" && value !== null && value !== undefined
    ? Number(value)
    : defaultValue;
}
