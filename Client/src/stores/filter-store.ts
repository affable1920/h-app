import type { ServerParams } from "@/types/http";
import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import { useSearchParams } from "react-router-dom";

export type FilterState = Omit<
  NonNullable<ServerParams>,
  "max" | "page" | "searchQuery" | "maxDistance"
>;

export type FilterKey = keyof FilterState;

let filters: FilterState = {};
const listeners: Set<() => void> = new Set();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return function () {
    listeners.delete(cb);
  };
}

function setFilters(next: FilterState | ((p: FilterState) => FilterState)) {
  filters = typeof next === "function" ? next(filters) : next;
  listeners.forEach(function (l) {
    l();
  });
}

function getSnapshot() {
  return filters;
}

function useFilterStore() {
  const [searchParams] = useSearchParams();
  const filters = useSyncExternalStore(subscribe, getSnapshot);

  useEffect(function () {
    function getNumberParam(key: FilterKey) {
      return !!searchParams.get(key) ? Number(searchParams.get(key)) : null;
    }

    const sortOrderParam = searchParams.get("sortOrder") ?? undefined;
    const sortOrder: FilterState["sortOrder"] =
      sortOrderParam === "asc" || sortOrderParam === "desc"
        ? sortOrderParam
        : undefined;

    setFilters({
      specialization: searchParams.get("specialization"),
      minRating: getNumberParam("minRating"),
      currentlyAvailable:
        searchParams.get("currentlyAvailable") === "1" ? "1" : null,
      gender: (searchParams.get("gender") as FilterState["gender"]) ?? null,
      experience: getNumberParam("experience"),
      fee: getNumberParam("fee"),
      sortBy: searchParams.get("sortBy") ?? undefined,
      sortOrder,
    });
  }, []);

  const handleFilterUpdate = useCallback(function handleFilterUpdate<
    K extends FilterKey,
  >(key: K, val: FilterState[K]) {
    setFilters(function (p) {
      return { ...p, [key]: val };
    });
  }, []);

  function reset() {
    setFilters({});
  }

  const activeFiltersCount = useMemo(
    function () {
      return Object.values(filters).filter(Boolean).length;
    },
    [filters],
  );

  const clearField = useCallback(function <K extends FilterKey>(key: K) {
    const next = key === "sortBy" || key === "sortOrder" ? undefined : null;
    handleFilterUpdate(key, next as FilterState[K]);
  }, []);

  const allUpdatesFlushed = useMemo(
    function () {
      // keys as filterkey array prevents allUpdatesFlushed var being incorrectly false when filters = {}
      const keys: Array<FilterKey> = [
        "currentlyAvailable",
        "minRating",
        "specialization",
        "fee",
        "experience",
        "gender",
        "sortBy",
      ];

      return keys.every(function (key) {
        const urlVal = searchParams.get(key);

        const filterVal = filters[key];
        return (
          (!!urlVal ? String(urlVal) : null) ===
          (!!filterVal ? String(filterVal) : null)
        );
      });
    },
    [filters],
  );

  const publicApi = {
    filters,
    handleFilterUpdate,
    reset,
    activeFiltersCount,
    allUpdatesFlushed,
    clearField,
  };

  return publicApi;
}

export default useFilterStore;
