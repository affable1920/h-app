import { useState } from "react";
import { useSearchParams } from "react-router-dom";

type StoreState = {
  max: number;
  page: number;
  currEntityCount: number;
  searchQuery: string | null;
  sort?: { by: string; order: "asc" | "desc" };
  [k: string]: any;
};

type StoreActions = {
  setPage: (cp: number) => void;
  setEntityCount: (c: number) => void;
  setSearchQuery: (sq: string) => void;

  reset: () => void;
  clearSearchQuery: () => void;
  set?: (key: string, val: any) => void;
};

function useQueryStore(): StoreState & StoreActions {
  const max = 8;

  const [currEntityCount, setCurrEntityCount] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get("page") ?? 1);
  const searchQuery = searchParams.get("searchQuery") ?? null;

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

  function set(key: string, val: any) {
    setSearchParams((p) => {
      p.set(key, val);
      return p;
    });
  }

  const store = {
    max,
    page,
    reset,
    setPage,
    setEntityCount(count: number) {
      setCurrEntityCount(count);
    },

    set,
    searchQuery,
    setSearchQuery,
    currEntityCount,
    clearSearchQuery,
  };

  return store;
}

export default useQueryStore;
