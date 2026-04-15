import type { ServerParams } from "@/types/http";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

type FilterState = Omit<
  NonNullable<ServerParams>,
  "max" | "page" | "sortBy" | "sortOrder" | "searchQuery"
>;

type FilterKey = keyof FilterState;

function useFilterStore() {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState<FilterState>({});

  useEffect(function () {
    setFilters(function () {
      const ca = searchParams.get("currentlyAvailable");

      return {
        maxDistance: Number(searchParams.get("maxDistance")),
        minRating: Number(searchParams.get("minRating")),
        currentlyAvailable: ca === "1" ? ca : null,
        specialization: searchParams.get("specialization"),
      };
    });
  }, []);

  function handleFilterUpdate<K extends FilterKey>(
    key: K,
    val: FilterState[K],
  ) {
    setFilters(function (p) {
      return { ...p, [key]: p[key] === val ? null : val };
    });
  }

  function reset() {
    setFilters({});
  }

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  const publicApi = {
    filters,
    handleFilterUpdate,
    reset,
    get activeFiltersCount() {
      return activeFiltersCount;
    },
  };

  return publicApi;
}

export default useFilterStore;
