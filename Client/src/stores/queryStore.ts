import type { ServerParams } from "@/types/http";
import { useSearchParams } from "react-router-dom";

/*
We pick only those parameters in our query store changes
to which we want to reflect asap, not on the click of a button like we do for actual filter properties
like specialization -> letting the user choose the value first, then confirm
* */

type StoreState = Pick<
  ServerParams,
  "max" | "page" | "searchQuery" | "sortBy" | "sortOrder"
>;

type AllowedSortCol = StoreState["sortBy"];
export type SortOrder = StoreState["sortOrder"];

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
  const searchQuery = searchParams.get("searchQuery");

  const sortProp = searchParams.get("sortBy");
  const sortBy: AllowedSortCol = (sortProp as AllowedSortCol) ?? "rating";

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
    setSearchParams(function (p) {
      p.delete("searchQuery");
      return p;
    });
  }

  function setPage(pg: number) {
    setSearchParams(function (p) {
      p.set("page", pg.toString());
      return p;
    });
  }

  function reset() {
    setSearchParams({});
  }

  function setSort(field: string | null, order: SortOrder) {
    setSearchParams(function (p) {
      if (field) {
        p.set("sortBy", field);
      }

      p.set("sortOrder", String(order));
      return p;
    });
  }

  const storeApi = {
    max,
    page,
    reset,
    sortBy,
    sortOrder,
    searchQuery,

    setPage,
    setSort,
    setSearchQuery,
    clearSearchQuery,
  };

  // function api(key: keyof StoreState) {
  //   return storeApi[key]
  // }

  return storeApi;
}

export default useQueryStore;
