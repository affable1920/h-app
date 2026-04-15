import { useState, Suspense, useMemo } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import Spinner from "../Spinner";
import Input from "@/components/ui/Input";

import Pagination from "@components/Pagination";
import Button from "@/components/ui/Button";

import { debounce } from "@/utils/appUtils";

import useModalStore from "@/stores/modalStore";
import useQueryStore from "@/stores/queryStore";

import { ArrowDown01, ArrowDown10 } from "lucide-react";
import { ArrowLeftRight, X, SlidersHorizontal } from "lucide-react";
import useFilterStore from "@/stores/filterStore";
import Badge from "../ui/Badge";

const Directory = () => {
  const navigate = useNavigate();
  const [localSearch, setLocalSearch] = useState("");

  const {
    searchQuery,
    setSearchQuery,
    clearSearchQuery,
    sortOrder = "desc",
    sortBy,
    setSort,
  } = useQueryStore();

  const location = useLocation().pathname.split("/").at(-1) ?? "doctors";
  const openModal = useModalStore((s) => s.openModal);

  const { activeFiltersCount } = useFilterStore();

  const memoized = useMemo(() => debounce(setSearchQuery), []);

  function handleDirectorySwitch() {
    const nextDir = location === "doctors" ? "clinics" : "doctors";
    navigate(`${nextDir}`);
  }

  const openDirectoryFilter = function (name: string) {
    return openModal.bind(null, name, {
      viewOverlay: true,
      position: "bottom",
    });
  };

  function handleSearch(ev: React.ChangeEvent<HTMLInputElement>) {
    const val = ev.target.value;

    setLocalSearch(val);
    memoized(val);
  }

  function removeSearchQuery() {
    setLocalSearch("");
    clearSearchQuery();
  }

  const handleSort = setSort.bind(
    null,
    sortBy ?? "rating",
    sortOrder === "asc" ? "desc" : "asc",
  );

  return (
    <section className="flex flex-col gap-4 mx-auto">
      <section className="w-full rounded-md flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            className="relative"
            onClick={openDirectoryFilter("directoryFilter")}
          >
            <SlidersHorizontal />
            {!!activeFiltersCount && (
              <span className="absolute -top-2 -right-2 bg-accent text-white rounded-md w-4 h-4 flex items-center justify-center text-xs">
                {activeFiltersCount}
              </span>
            )}
          </Button>

          <Button
            variant="ghost"
            onClick={openDirectoryFilter("sorter")}
            data-tooltip={`sorted by ${sortBy} - ${sortOrder}`}
          >
            {sortOrder === "asc" ? (
              <ArrowDown01 />
            ) : (
              sortOrder === "desc" && <ArrowDown10 />
            )}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {/* search bar */}
          <div className="relative flex items-center">
            <Input
              id="searchQuery"
              value={localSearch}
              placeholder="Search"
              size="sm"
              className="italic placeholder:text-sm py-2"
              onChange={handleSearch}
            />
            {!!searchQuery && (
              <Button className="absolute right-2" variant="ghost" size="sm">
                <X onClick={removeSearchQuery} />
              </Button>
            )}
          </div>

          <Button variant="ghost" onClick={handleDirectorySwitch}>
            <ArrowLeftRight />
          </Button>
        </div>
      </section>

      <section className="grid gap-6 grid-cols-[repeat(auto-fill,minmax(400px,1fr))]">
        <Suspense fallback={<Spinner />}>
          <Outlet />
        </Suspense>
      </section>

      <Pagination />
    </section>
  );
};

export default Directory;
