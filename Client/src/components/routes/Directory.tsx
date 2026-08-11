import { useState, Suspense, useCallback, useRef, useEffect } from "react";
import {
  Outlet,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import Spinner from "../ui/Spinner";
import Pagination from "@components/Pagination";
import Button from "@/components/ui/Button";
import { debounce } from "@/utils/utils";
import useModalStore from "@/stores/modal-store";
import { ArrowLeftRight, SlidersHorizontal } from "lucide-react";
import useFilterStore from "@/stores/filter-store";
import SearchBar from "../ui/SearchBar";
import { Stack } from "../ui/Stack";

function Directory() {
  const navigate = useNavigate();
  const openModal = useModalStore((s) => s.openModal);
  const route = useLocation().pathname.split("/").at(-1) ?? "doctors";

  const [params, setParams] = useSearchParams();
  const { activeFiltersCount } = useFilterStore();
  const [localSearch, setLocalSearch] = useState<string | null>(null);
  const [hasNext, setHasNext] = useState(false);

  const page = params.get("page") ? Number(params.get("page")) : 1;

  useEffect(
    function () {
      setLocalSearch(params.get("searchQuery"));
    },
    [params.get("searchQuery")],
  );

  const setPage = useCallback(function (pg: number) {
    setParams(function (prev) {
      const next = new URLSearchParams(prev);
      next.set("page", String(pg));
      return next;
    });
  }, []);

  const setSearchQuery = useRef(
    debounce(function (sq: string) {
      const key = "searchQuery";
      setParams(function (prev) {
        const next = new URLSearchParams(prev);

        next.set(key, sq);
        next.set("page", "1");

        return next;
      });
    }, 350),
  ).current;

  const handleSearch = useCallback(function (val: string) {
    setLocalSearch(val);
    setSearchQuery(val);
  }, []);

  const clearSearch = useCallback(function () {
    setLocalSearch("");
    setParams(function (prev) {
      const next = new URLSearchParams(prev);
      next.delete("searchQuery");
      return next;
    });
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

        <Stack align="center">
          <SearchBar
            clearable={true}
            onChange={function (ev) {
              handleSearch(ev.currentTarget.value);
            }}
            val={localSearch ?? ""}
            onClear={clearSearch}
          />

          <Button
            className="self-stretch"
            variant="icon"
            bg={true}
            onClick={switchDirectory}
          >
            <ArrowLeftRight />
          </Button>
        </Stack>
      </section>

      <section className="grid gap-6 grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
        <Suspense fallback={<Spinner />}>
          <Outlet context={setHasNext} />
        </Suspense>
      </section>

      <Pagination
        onPageChange={handlePageChange}
        currentPage={page}
        hasNext={hasNext ?? false}
      />
    </section>
  );
}

export default Directory;
