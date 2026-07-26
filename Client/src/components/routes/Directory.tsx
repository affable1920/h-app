import { useState, Suspense, useCallback, useRef, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Spinner from "../ui/Spinner";
import Pagination from "@components/Pagination";
import Button from "@/components/ui/Button";
import { debounce } from "@/utils/utils";
import useModalStore from "@/stores/modal-store";
import useQueryStore from "@/stores/query-store";
import { ArrowLeftRight, SlidersHorizontal } from "lucide-react";
import useFilterStore from "@/stores/filter-store";
import SearchBar from "../ui/SearchBar";

function Directory() {
  const navigate = useNavigate();
  const openModal = useModalStore((s) => s.openModal);

  const {
    searchQuery,
    setSearchQuery,
    clearSearchQuery,
    page = 1,
    setPage,
  } = useQueryStore();
  const { activeFiltersCount } = useFilterStore();

  const route = useLocation().pathname.split("/").at(-1) ?? "doctors";
  const memoized = useRef(debounce(setSearchQuery, 350)).current;

  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [hasNext, setHasNext] = useState(false);

  const handleSearch = useCallback(function (val: string) {
    setLocalSearch(val);
    memoized(val);
  }, []);

  const clearSearch = useCallback(function () {
    setLocalSearch("");
    clearSearchQuery();
  }, []);

  const handlePageChange = useCallback(
    function (direction: "next" | "previous") {
      const isChangeInvalid =
        (page === 1 && direction === "previous") ||
        (!hasNext && direction === "next");

      if (isChangeInvalid) {
        return;
      }

      const nextPage = direction === "next" ? page + 1 : page - 1;
      setPage(nextPage);
    },
    [page, hasNext],
  );

  function switchDirectory() {
    const nextDir = route === "doctors" ? "clinics" : "doctors";
    navigate(`${nextDir}`);
  }

  return (
    <section className="flex flex-col gap-8 mx-auto min-h-screen">
      <section className="w-full rounded-md flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="icon"
            bg={true}
            className="relative"
            onClick={function () {
              openModal("directoryFilter", {
                position: "left",
              });
            }}
          >
            <SlidersHorizontal />
            {!!activeFiltersCount && (
              <span className="absolute -top-2 -right-2 bg-accent text-white rounded-md w-4 h-4 flex items-center justify-center text-xs">
                {activeFiltersCount}
              </span>
            )}
          </Button>
        </div>

        <div className="flex gap-2 items-center">
          <SearchBar
            clearable={true}
            onChange={handleSearch}
            val={localSearch ?? ""}
            onClear={clearSearch}
          />

          <Button variant="icon" bg={true} onClick={switchDirectory}>
            <ArrowLeftRight />
          </Button>
        </div>
      </section>

      <section className="grid gap-6 grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
        <Suspense fallback={<Spinner />}>
          <Outlet context={{ setHasNext }} />
        </Suspense>
      </section>

      <Pagination
        currentPage={page}
        hasNext={hasNext ?? false}
        onPrevious={function () {
          handlePageChange("previous");
        }}
        onNext={function () {
          handlePageChange("next");
        }}
      />
    </section>
  );
}

export default Directory;
