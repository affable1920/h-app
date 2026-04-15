import { useEffect, useState } from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined);

  useEffect(function () {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    function onChange() {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    }

    // Set the state on mount to get the correct value initially as well.
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);

    mql.addEventListener("change", onChange);

    return function () {
      mql.removeEventListener("change", onChange);
    };
  }, []);

  // ALways a return a boolean
  return !!isMobile;
}
