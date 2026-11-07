import {
  readGivenFilters,
  countActive,
  writeFilter,
} from "@/domain/querying/filtering";
import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { appointmentFilterDefinitions } from "@/domain/querying/appointment-filters";
import { defaultDefinitions, type Parsed } from "@/domain/querying/shared";

const allDefs = {
  ...appointmentFilterDefinitions,
  ...defaultDefinitions,
};

type FilterName = keyof typeof allDefs;
type ResetSelection = Partial<Record<FilterName, true>>;

type FilterValues = Parsed<typeof allDefs>;

export function useFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = readGivenFilters(searchParams, allDefs);

  const setFilter = useCallback(
    function <T extends FilterName>(name: T, value: FilterValues[T]) {
      const parsedValue = value !== null ? String(value) : null;

      setSearchParams(function (prev) {
        return writeFilter(
          prev,
          name === "appointmentStatus" ? allDefs[name] : name,
          parsedValue,
        );
      });
    },
    [setSearchParams],
  );

  function handlePageChange(direction: "next" | "previous") {
    const currentPage = filters.page as number;

    if (currentPage === 1 && direction === "previous") {
      return;
    }

    const updated = direction === "next" ? currentPage + 1 : currentPage - 1;
    setFilter("page", updated);
  }

  const activeFiltersCount = useMemo(
    function () {
      return countActive(searchParams, allDefs);
    },
    [searchParams],
  );

  const reset = useCallback(
    function (selection?: ResetSelection) {
      const names = (
        selection === undefined ? Object.keys(filters) : Object.keys(selection)
      ) as Array<FilterName>;

      setSearchParams(function (prev) {
        const next = new URLSearchParams(prev);
        let shouldResetPage = false;

        for (const name of names) {
          const definition = allDefs[name];
          next.delete(definition.key);

          shouldResetPage ||= definition.resetsPageOnChange ?? false;
        }

        if (shouldResetPage) {
          next.delete("page");
        }

        return next;
      });
    },
    [setSearchParams, filters],
  );

  return {
    ...filters,
    handlePageChange,
    activeFiltersCount,
    setFilter,
    reset,
  };
}
