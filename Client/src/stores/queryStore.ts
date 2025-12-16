import { useState } from "react";
import type { paths } from "@/types/api";
import { useSearchParams } from "react-router-dom";

type ServerQuery = NonNullable<paths["/doctors"]["get"]["parameters"]["query"]>;

type StoreActions = {
  setPage: (cp: number) => void;
  setEntityCount: (c: number) => void;
  setSearchQuery: (sq: string) => void;

  reset: () => void;
  clearSearchQuery: () => void;
  setQuery: <T extends keyof ServerQuery>(key: T, val: ServerQuery[T]) => void;
};

function useQueryStore(): ServerQuery & StoreActions {
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

  function setQuery<T extends keyof ServerQuery>(key: T, val: ServerQuery[T]) {
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

    setQuery,
    searchQuery,
    setSearchQuery,
    currEntityCount,
    clearSearchQuery,
  };

  return store;
}

export default useQueryStore;
