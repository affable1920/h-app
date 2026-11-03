import {
  appointmentFilterDefinitions,
  countActive,
  readFilters,
  writeFilter,
  type FilterName,
  type FilterValues,
} from "@/utils/filters";
import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

type ResetSelection = Partial<Record<FilterName, true>>;

export function useFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const baseFilters = readFilters(searchParams);

  const setFilter = useCallback(
    function <T extends FilterName>(name: T, value: FilterValues[T]) {
      const parsedValue = value !== null ? String(value) : null;

      setSearchParams(function (prev) {
        return writeFilter(prev, name, parsedValue);
      });
    },
    [setSearchParams],
  );

  function handlePageChange(direction: "next" | "previous") {
    const currentPage = baseFilters.page;

    if (currentPage === 1 && direction === "previous") {
      return;
    }

    const updated = direction === "next" ? currentPage + 1 : currentPage - 1;
    setFilter("page", updated);
  }

  const activeFiltersCount = useMemo(
    function () {
      return countActive(searchParams);
    },
    [searchParams],
  );

  const reset = useCallback(
    function (selection?: ResetSelection) {
      const names = (
        selection === undefined
          ? Object.keys(appointmentFilterDefinitions)
          : Object.keys(selection)
      ) as Array<FilterName>;

      setSearchParams(function (prev) {
        const next = new URLSearchParams(prev);
        let shouldResetPage = false;

        for (const name of names) {
          const definition = appointmentFilterDefinitions[name];
          next.delete(definition.key);

          shouldResetPage ||= definition.resetsPageOnChange ?? false;
        }

        if (shouldResetPage) {
          next.delete("page");
        }

        return next;
      });
    },
    [setSearchParams],
  );

  return {
    ...baseFilters,
    handlePageChange,
    activeFiltersCount,
    setFilter,
    reset,
  };
}
