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

  return function memoized(...args: Args) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(function () {
      fn(...args);
    }, ms);
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

export function sort<T>(items: Array<T> = [], fn: (a: T, b: T) => number) {
  return items.sort(fn);
}

export function filter<T>(
  items: Array<T> = [],
  predicate: (a: T, index: number, array: T[]) => unknown,
) {
  return items.filter(predicate);
}
