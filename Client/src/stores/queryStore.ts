import type { paths } from "@/types/api";
import { useSearchParams } from "react-router-dom";

type ServerQuery = NonNullable<paths["/doctors"]["get"]["parameters"]["query"]>;
type StoreState = Pick<
  ServerQuery,
  "max" | "page" | "searchQuery" | "sortBy" | "sortOrder"
>;
type SortOrder = StoreState["sortOrder"];

type StoreActions = {
  setPage: (cp: number) => void;
  setSearchQuery: (sq: string) => void;
  setSort: (field: string, order: SortOrder) => void;

  reset: () => void;
  clearSearchQuery: () => void;
};

function useQueryStore(): StoreState & StoreActions {
  const max = 8;

  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page") ?? 1);
  const searchQuery = searchParams.get("searchQuery") ?? null;

  const sortBy: StoreState["sortBy"] = searchParams.get("sortBy") ?? "rating";
  const sortOrderParam = searchParams.get("sortOrder");
  const sortOrder: SortOrder =
    sortOrderParam === "asc" || sortOrderParam === "desc"
      ? sortOrderParam
      : "desc";

  function setSearchQuery(sq: string) {
    const key = "searchQuery";
    setSearchParams((p) => {
      p.set(key, sq);
      p.set("page", "1");

      return p;
    });
  }

  function clearSearchQuery() {
    setSearchParams((p) => {
      p.delete("searchQuery");
      return p;
    });
  }

  function setPage(cp: number) {
    setSearchParams((p) => {
      p.set("page", cp.toString());
      return p;
    });
  }

  function reset() {
    setSearchParams({});
  }

  function setSort(field: string | null, order: SortOrder) {
    setSearchParams((p) => {
      if (field) {
        p.set("sortBy", field);
      }

      p.set("sortOrder", String(order));
      return p;
    });
  }

  const store = {
    max,
    page,
    reset,
    setPage,
    sortBy,
    sortOrder,
    setSort,

    searchQuery,
    setSearchQuery,
    clearSearchQuery,
  };

  return store;
}

export default useQueryStore;
