import { useSyncExternalStore } from "react";

type Tier = "base" | "md" | "lg";
const md = 768,
  lg = 1024;

function subscribe(cb: () => void) {
  const mdMql = window.matchMedia(`(min-width: ${md}px)`);
  const lgMql = window.matchMedia(`(min-width: ${lg}px)`);

  mdMql.addEventListener("change", cb);
  lgMql.addEventListener("change", cb);

  return function () {
    mdMql.removeEventListener("change", cb);
    lgMql.removeEventListener("change", cb);
  };
}

function getSnapshot(): Tier {
  if (window.matchMedia(`(min-width: ${lg}px)`).matches) {
    return "lg";
  }

  if (window.matchMedia(`(min-width: ${md}px)`).matches) {
    return "md";
  }

  return "base";
}

export function useBreakpoint(): Tier {
  return useSyncExternalStore(subscribe, getSnapshot);
}
