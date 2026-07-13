import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const previousPath: { value: string | null } = { value: null };

export function usePrevious() {
  const { pathname: route } = useLocation();

  useEffect(
    function () {
      return function () {
        previousPath.value = route;
      };
    },
    [route],
  );

  return previousPath.value;
}
