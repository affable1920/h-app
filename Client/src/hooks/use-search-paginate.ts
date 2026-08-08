import { paginate } from "@/utils/utils";
import { useMemo, useReducer, type ChangeEvent } from "react";

type PaginateState = { query: string; iteration: number; direction: 1 | -1 };

type PaginateAction =
  | { type: "SEARCH"; query: string }
  | { type: "NEXT" }
  | { type: "PREV" }
  | { type: "RESET" };

const initial: PaginateState = {
  query: "",
  iteration: 1,
  direction: 1,
};

function paginateReducer(
  state: PaginateState,
  action: PaginateAction,
): PaginateState {
  switch (action.type) {
    case "SEARCH":
      return { ...state, query: action.query, iteration: 1 };

    case "NEXT":
      return { ...state, iteration: state.iteration + 1, direction: 1 };

    case "PREV":
      return {
        ...state,
        iteration: Math.max(1, state.iteration - 1),
        direction: -1,
      };

    case "RESET":
      return {
        ...initial,
      };
  }
}

type UseSearchPaginateOpts<T> = {
  max?: number;
  filterFn: (item: T, query: string) => boolean; // must be a stable reference
  sortFn?: (a: T, b: T) => number; // must be a stable reference
};

export function useSearchPaginate<T>(
  items: T[],
  opts: UseSearchPaginateOpts<T>,
) {
  const { max = 5, filterFn, sortFn } = opts;
  const [state, dispatch] = useReducer(paginateReducer, initial);

  const filtered = useMemo(
    function () {
      const searched = items.filter(function (v) {
        return filterFn(v, state.query);
      });

      const sorted = sortFn ? searched.sort(sortFn) : searched;
      return paginate(sorted, state.iteration, max);
    },
    [items, state.query, sortFn, filterFn, state.iteration],
  );

  const maxIterCount = Math.ceil(items.length / max);

  return {
    query: state.query,
    items: filtered,
    hasPrev: state.iteration > 1,
    hasNext: state.iteration <= maxIterCount,
    direction: state.direction,
    iteration: state.iteration,
    search(sq: string | ChangeEvent<HTMLInputElement>) {
      const query = typeof sq === "string" ? sq : sq.currentTarget.value;
      dispatch({
        type: "SEARCH",
        query,
      });
    },
    prev() {
      dispatch({ type: "PREV" });
    },
    next() {
      if (state.iteration >= maxIterCount) {
        return;
      }
      dispatch({ type: "NEXT" });
    },
    reset() {
      dispatch({
        type: "RESET",
      });
    },
  };
}
