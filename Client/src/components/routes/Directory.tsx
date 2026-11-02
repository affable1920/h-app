import { useState, useCallback, useMemo } from "react";
import {
  Outlet,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import Pagination from "@components/Pagination";
import Button from "@/components/lib/button/Button";
import useModalStore from "@/stores/modal-store";
import { ArrowLeftRight, SlidersHorizontal } from "lucide-react";
import SearchBar from "../ui/SearchBar";
import { Stack } from "../ui/Stack";
import DirectoryLayout from "../lib/DirectoryLayout";
import { PageLayout } from "./PageLayout";
import type { Filters } from "@/types/pagination";
import { parseNumberParam } from "@/utils/utils";

export const FILTER_KEYS: Array<keyof Filters> = [
  "specialization",
  "minRating",
  "currentlyAvailable",
  "verified",
  "gender",
  "experience",
  "fee",
  "sortColumn",
  "sortOrder",
] as const;

const sq = "searchQuery";

function Directory() {
  const currentView = useLocation().pathname.split("/").at(-1) ?? "doctors";
  const viewOnSwitch = currentView === "doctors" ? "clinics" : "doctors";

  const navigate = useNavigate();
  const openModal = useModalStore((s) => s.openModal);

  const [params, setParams] = useSearchParams();
  const [hasNext, setHasNext] = useState(false);

  const page = parseNumberParam(params, "page", 1);
  const searchQuery = params.get(sq) ?? null;

  const activeFilterCount = useMemo(
    function () {
      return Object.entries(Object.fromEntries(params.entries()))
        .filter(function ([key, val]) {
          return (
            key !== "sortOrder" &&
            Array.prototype.includes.call(FILTER_KEYS, key) &&
            Boolean(val)
          );
        })
        .filter(Boolean).length;
    },
    [params],
  );

  const setPage = useCallback(
    function (pg: number) {
      setParams(function (prev) {
        const next = new URLSearchParams(prev);
        next.set("page", String(pg));
        return next;
      });
    },
    [setParams],
  );

  const handleSearch = useCallback(
    function (query: string) {
      setParams(function (prev) {
        const next = new URLSearchParams(prev);

        next.set(sq, query);
        next.set("page", "1");

        return next;
      });
    },
    [setParams],
  );

  function clearSearch() {
    setParams(function (prev) {
      const next = new URLSearchParams(prev);
      next.delete(sq);
      return next;
    });
  }

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
    [page, hasNext, setPage],
  );

  function switchDirectory() {
    navigate(`../${viewOnSwitch}`, {
      replace: true,
    });
  }

  return (
    <PageLayout>
      <DirectoryLayout>
        <DirectoryLayout.Header className="justify-between">
          <Button
            variant="icon"
            bg={true}
            data-tooltip="filters"
            aria-label="filter-opener"
            className="relative"
            onClick={function () {
              openModal("directory-filter-modal", {
                position: "left",
              });
            }}
          >
            <SlidersHorizontal />
            {!!activeFilterCount && (
              <span
                className="absolute -top-2 -right-2 bg-accent text-white rounded-md 
              w-4 h-4 flex items-center justify-center text-xs"
              >
                {activeFilterCount}
              </span>
            )}
          </Button>

          <Stack align="center">
            <SearchBar
              value={searchQuery}
              id="directory-search"
              aria-label={`search ${currentView}`}
              clearable={true}
              onClear={clearSearch}
              onChange={handleSearch}
              size="xs"
            />

            <Button
              variant="icon"
              bg={true}
              aria-label={`switch view to ${viewOnSwitch}`}
              data-tooltip={`switch to ${viewOnSwitch}`}
              onClick={switchDirectory}
            >
              <ArrowLeftRight />
            </Button>
          </Stack>
        </DirectoryLayout.Header>

        <DirectoryLayout.Content className="grid gap-6 grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
          <Outlet context={setHasNext} />
        </DirectoryLayout.Content>

        <DirectoryLayout.Footer>
          <Pagination
            currentPage={page}
            onPageChange={handlePageChange}
            hasNext={hasNext}
          />
        </DirectoryLayout.Footer>
      </DirectoryLayout>
    </PageLayout>
  );
}

export default Directory;
