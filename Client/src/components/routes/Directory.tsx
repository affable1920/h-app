import { useState, Suspense, useMemo, useCallback } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import Spinner from "../ui/Spinner";

import Pagination from "@components/Pagination";
import Button from "@/components/ui/Button";

import { debounce } from "@/utils/utils";

import useModalStore from "@/stores/modalStore";
import useQueryStore from "@/stores/queryStore";

import { ArrowDown01, ArrowDown10 } from "lucide-react";
import { ArrowLeftRight, X, SlidersHorizontal } from "lucide-react";
import useFilterStore from "@/stores/filterStore";
import SearchBar from "../ui/SearchBar";

const SORT_COLS: Array<string> = [
  "rating",
  "distance",
  "reviews",
  "experience",
  "fee",
  "name",
] as const;

function Directory() {
  const navigate = useNavigate();

  const {
    searchQuery,
    setSearchQuery,
    clearSearchQuery,
    sortOrder = "desc",
    sortBy,
  } = useQueryStore();
  const [localSearch, setLocalSearch] = useState(searchQuery);

  const location = useLocation().pathname.split("/").at(-1) ?? "doctors";
  const openModal = useModalStore((s) => s.openModal);

  const { activeFiltersCount } = useFilterStore();

  const memoized = useMemo(() => debounce(setSearchQuery), []);

  function handleDirectorySwitch() {
    const nextDir = location === "doctors" ? "clinics" : "doctors";
    navigate(`${nextDir}`);
  }

  const handleSearch = useCallback(function (val: string) {
    setLocalSearch(val);
    memoized(val);
  }, []);

  const clearSearch = useCallback(function () {
    setLocalSearch("");
    clearSearchQuery();
  }, []);

  const open = function (modalName: string, options?: {}) {
    return openModal.bind(null, modalName, {
      ...options,
      viewOverlay: true,
      position: "bottom",
    });
  };

  return (
    <section className="flex flex-col gap-8 mx-auto">
      <section className="w-full rounded-md flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="icon"
            className="relative"
            onClick={open("directoryFilter")}
          >
            <SlidersHorizontal />
            {!!activeFiltersCount && (
              <span className="absolute -top-2 -right-2 bg-accent text-white rounded-md w-4 h-4 flex items-center justify-center text-xs">
                {activeFiltersCount}
              </span>
            )}
          </Button>

          <Button
            variant="icon"
            onClick={open("sorter", { fields: SORT_COLS })}
            data-tooltip={`sorted by ${sortBy} - ${sortOrder}`}
          >
            {sortOrder === "asc" ? (
              <ArrowDown01 />
            ) : (
              sortOrder === "desc" && <ArrowDown10 />
            )}
          </Button>
        </div>

        <div className="flex gap-2 items-center">
          <SearchBar
            onChange={handleSearch}
            val={localSearch ?? ""}
            onClear={clearSearch}
            clearable
          />

          <Button variant="icon" onClick={handleDirectorySwitch}>
            <ArrowLeftRight />
          </Button>
        </div>
      </section>

      <section className="grid gap-6 grid-cols-[repeat(auto-fill,minmax(360px,1fr))]">
        <Suspense fallback={<Spinner />}>
          <Outlet />
        </Suspense>
      </section>

      <Pagination />
    </section>
  );
}

export default Directory;
