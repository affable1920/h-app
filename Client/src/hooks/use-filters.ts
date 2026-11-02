import type { AppointmentStatus } from "@/types/appointment";
import { APPOINTMENT_STATUSES } from "@/utils/constants";
import { parseNumberParam } from "@/utils/utils";
import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

const statusKey = "appointmentStatus";
const sq = "searchQuery";

const statusesSet = new Set([
  ...APPOINTMENT_STATUSES.map((s) => s.toLowerCase()),
]);

function parseSortOrderParam(value: string | null): "asc" | "desc" | undefined {
  if (value === "asc" || value === "desc") {
    return value;
  }
  return undefined;
}

export function useFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const appointmentStatus: AppointmentStatus | null = statusesSet.has(
    searchParams.get(statusKey) ?? "",
  )
    ? (searchParams.get(statusKey) as AppointmentStatus)
    : null;

  const page = parseNumberParam(searchParams, "page", 1);
  const searchQuery = searchParams.get(sq) ?? null;

  const sortColumn = searchParams.get("sortColumn") ?? null;
  const sortOrder = parseSortOrderParam(searchParams.get("sortOrder"));

  function handleSort(column: string, order: "asc" | "desc" = "asc") {
    setSearchParams(function (prev) {
      const next = new URLSearchParams(prev);
      next.set("sortColumn", column);
      next.set("sortOrder", order);
      next.set("page", "1");

      return next;
    });
  }

  function handleSearch(query: string) {
    setSearchParams(function (prev) {
      const next = new URLSearchParams(prev);
      next.set(sq, query);
      next.set("page", "1");
      return next;
    });
  }
  const handlePageChange = useCallback(
    function (direction: "next" | "previous") {
      if (page === 1 && direction === "previous") {
        return;
      }

      const updated = direction === "next" ? page + 1 : page - 1;

      setSearchParams(function (prev) {
        const next = new URLSearchParams(prev);
        next.set("page", String(updated));

        return next;
      });
    },
    [page, setSearchParams],
  );

  const handleStatusChange = useCallback(
    function (status: AppointmentStatus) {
      setSearchParams(function (prev) {
        const next = new URLSearchParams(prev);

        if (prev.get(statusKey) === status) {
          return next;
        } else {
          next.set(statusKey, status);
          next.set("page", "1");
        }

        return next;
      });
    },
    [setSearchParams],
  );

  const activeFiltersCount = useMemo(
    function () {
      return Array.from(searchParams.entries())
        .filter(function ([key, value]) {
          return (
            (key === statusKey && statusesSet.has(value)) ||
            (key === sq && Boolean(value) && value.trim() !== "")
          );
        })
        .filter(Boolean).length;
    },
    [searchParams],
  );

  const reset = useCallback(
    function (
      filterKey?: "page" | typeof sq | typeof statusKey | "sortColumn",
    ) {
      if (!filterKey) {
        setSearchParams(new URLSearchParams());
      } else {
        setSearchParams(function (prev) {
          const next = new URLSearchParams(prev);
          next.delete(filterKey);
          next.delete("page");
          return next;
        });
      }
    },
    [setSearchParams],
  );

  const resetSort = useCallback(
    function () {
      setSearchParams(function (prev) {
        const next = new URLSearchParams(prev);
        next.delete("sortColumn");
        next.delete("sortOrder");
        next.delete("page");
        return next;
      });
    },
    [setSearchParams],
  );

  function changeSortOrder(order: "asc" | "desc") {
    setSearchParams(function (prev) {
      const next = new URLSearchParams(prev);

      if (order === prev.get("sortOrder")) {
        return next;
      }

      next.set("sortOrder", order);
      return next;
    });
  }

  return {
    sortColumn,
    sortOrder,
    page,
    appointmentStatus,
    searchQuery,
    handlePageChange,
    handleStatusChange,
    activeFiltersCount,
    reset,
    handleSearch,
    handleSort,
    resetSort,
    changeSortOrder,
  };
}
