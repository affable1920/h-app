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

export function parseNumber(
  raw: string | null,
  defaultValue: number | null = null,
): number | null {
  /**
   * parse incoming string as a number if it passes isSafeInteger,
   * accepts a default, which defaults to null
   */
  const value = raw === null ? NaN : Number(raw);
  return Number.isSafeInteger(value) ? value : defaultValue;
}

export function safeParseNumber(
  raw: string | null,
  defaultValue: number = 1,
): number {
  /**
   * if raw equals null, we save value as NaN (not a safe integer)
   *
   * otherwise, there are two possibilities:
   * "" - an empty string, resulting in value being 0.
   * "abc" | "1" - (a non-empty string), value to be NaN if the
   * string can't possibly be number converted, else the number.
   *
   * so, we either end up with 0, NaN, or a Number
   * Number.isSafeInteger
   * - allows only 0 and the Number to pass
   * - then we check for the number being positive
   *
   * else, anyway we return the default 1
   */

  const value = raw === null ? NaN : Number(raw);
  return Number.isSafeInteger(value) && value > 0 ? value : defaultValue;
}

export function parseSwitch(raw: string | null): "1" | null {
  return raw !== null && raw === "1" ? raw : null;
}
