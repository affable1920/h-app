import type { paths } from "@/types/api";
import { useSearchParams } from "react-router-dom";

type ServerQuery = NonNullable<paths["/doctors"]["get"]["parameters"]["query"]>;

type StoreActions = {
  setPage: (cp: number) => void;
  setSearchQuery: (sq: string) => void;

  reset: () => void;
  clearSearchQuery: () => void;
  setQuery?: <T extends keyof ServerQuery>(key: T, val: ServerQuery[T]) => void;
};

function useQueryStore() {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get("page") ?? 1);
  const searchQuery = searchParams.get("searchQuery") ?? null;

  const maxDistance = Number(searchParams.get("maxDistance")) ?? null;
  const minRating = Number(searchParams.get("minRating") ?? null);
  const specialization = searchParams.get("specialization") ?? null;

  const currentlyAvailable =
    Boolean(searchParams.get("currentlyAvailable")) ?? null;

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

  // function setQuery<T extends keyof ServerQuery>(key: T, val: ServerQuery[T]) {
  //   if (val)
  //     setSearchParams((p) => {
  //       p.set(key, val.toString());
  //       return p;
  //     });
  // }

  function setSort(property: string, order: "asc" | "desc" = "asc") {
    searchParams.set("sortBy", property);
    searchParams.set("sortOrder", order);
  }

  const store: ServerQuery & StoreActions = {
    page,
    searchQuery,
    reset,
    setPage,
    // setQuery,
    setSearchQuery,
    clearSearchQuery,
  };

  return store;
}

export default useQueryStore;
