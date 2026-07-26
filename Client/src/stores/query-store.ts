import type { ServerParams } from "@/types/http";
import { useSearchParams } from "react-router-dom";

type StoreState = Pick<ServerParams, "max" | "page" | "searchQuery">;

type StoreActions = {
  setPage: (cp: number) => void;
  setSearchQuery: (sq: string) => void;
  reset: () => void;
  clearSearchQuery: () => void;
};

function useQueryStore(): StoreState & StoreActions {
  const [searchParams, setSearchParams] = useSearchParams();

  const searchQuery = searchParams.get("searchQuery") ?? null;
  const page = Number(searchParams.get("page")) ?? 1;
  const sortBy = searchParams.get("sortBy") ?? undefined;
  const sortCol = searchParams.get("sortOrder") ?? null;

  function setSearchQuery(sq: string) {
    const key = "searchQuery";

    setSearchParams(
      function (prev) {
        const next = new URLSearchParams(prev);
        next.set(key, sq);
        next.set("page", "1");
        return next;
      },
      { replace: true },
    );
  }

  function clearSearchQuery() {
    setSearchParams(function (p) {
      const next = new URLSearchParams(p);
      next.delete("searchQuery");

      return next;
    });
  }

  function setPage(pg: number) {
    setSearchParams(function (prev) {
      const next = new URLSearchParams(prev);
      next.set("page", String(pg));

      return next;
    });
  }

  function reset() {
    setSearchParams(new URLSearchParams());
  }

  const storeApi = {
    reset,
    sortBy,
    sortCol,
    searchQuery,
    page,
    setPage,
    setSearchQuery,
    clearSearchQuery,
  };

  return storeApi;
}

export default useQueryStore;
