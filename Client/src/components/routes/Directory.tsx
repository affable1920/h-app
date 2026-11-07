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
import {
  countActive,
  readDefaults,
  readGivenFilters,
  writeFilter,
} from "@/domain/querying/filtering";
import { doctorFilterDefinitions } from "@/domain/querying/doctor-filters";
import { clinicFilterDefinitions } from "@/domain/querying/clinic-filters";
import { AnimatePresence, motion } from "motion/react";
import { ViewSummary } from "../ViewSummary";

const directoryViews = {
  doctors: {
    filters: doctorFilterDefinitions,
    modal: "doctor-filter-modal",
  },
  clinics: {
    filters: clinicFilterDefinitions,
    modal: "clinic-filter-modal",
  },
} as const;

const PRIORITY_MAP = {
  viewing: 0,
  sortcolumn: 2,
  sortorder: 3,
} satisfies Record<string, number>;

const SUMMARY_COLUMN_MAP = {
  sortcolumn: "sorted by",
  minrating: "minimum rating",
  sortorder: "order",
  fee: "max fee",
};

function sortSummaries<T extends [string, unknown]>(a: T, b: T) {
  return (
    (PRIORITY_MAP[a[0].toLowerCase() as keyof typeof PRIORITY_MAP] ?? 1) -
    (PRIORITY_MAP[b[0].toLowerCase() as keyof typeof PRIORITY_MAP] ?? 1)
  );
}

function Directory() {
  const location = useLocation().pathname.split("/").at(-1) ?? "doctors";
  const viewOnSwitch = location === "doctors" ? "clinics" : "doctors";

  const currentView = directoryViews[location as keyof typeof directoryViews];

  const navigate = useNavigate();
  const openModal = useModalStore((s) => s.openModal);

  const [params, setParams] = useSearchParams();
  const [hasNext, setHasNext] = useState(false);

  const { searchQuery, page } = readDefaults(params, {
    searchQuery: true,
    page: true,
  });

  const activeFilterCount = useMemo(
    function () {
      return countActive(params, currentView.filters, {
        sortColumn: true,
      });
    },
    [currentView.filters, params],
  );

  const setPage = useCallback(
    function (pg: number) {
      setParams(function (prev) {
        return writeFilter(prev, "page", pg.toString());
      });
    },
    [setParams],
  );

  const handleSearch = useCallback(
    function (query: string) {
      setParams(function (prev) {
        return writeFilter(prev, "searchQuery", query);
      });
    },
    [setParams],
  );

  function clearSearch() {
    setParams(function (prev) {
      return writeFilter(prev, "searchQuery", null);
    });
  }

  const handlePageChange = useCallback(
    function (direction: "next" | "previous") {
      const isPageInvalid =
        (page === 1 && direction === "previous") ||
        (!hasNext && direction === "next");

      if (isPageInvalid) {
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

  const summaries = useMemo(
    function () {
      const filters = readGivenFilters(params, doctorFilterDefinitions, {
        sortColumn: true,
        sortOrder: true,
      });

      return Object.entries({ ...filters, ...{ Viewing: location } })
        .filter(([, val]) => Boolean(val))
        .sort(sortSummaries)
        .map(function ([key, value]) {
          return {
            key:
              SUMMARY_COLUMN_MAP[
                key.toLowerCase() as keyof typeof SUMMARY_COLUMN_MAP
              ] ?? key,
            value: value === "1" ? "True" : value,
            color: value === "1" ? "green" : ("secondary" as const),
          };
        });
    },
    [params, location],
  ) satisfies Array<{
    key: string;
    value: string | number | null;
    color: "dark" | "secondary" | "green" | "blue";
  }>;

  return (
    <PageLayout>
      <DirectoryLayout className="space-y-8">
        <DirectoryLayout.Header className="flex-col items-stretch">
          <Stack justify="between" align="center">
            <Button
              variant="icon"
              bg={true}
              data-tooltip={
                activeFilterCount ? activeFilterCount + " selected" : "filters"
              }
              aria-label="filter-opener"
              className="relative"
              onClick={function () {
                openModal(currentView.modal, {
                  position: "left",
                });
              }}
            >
              <SlidersHorizontal />
              {activeFilterCount > 0 && (
                <span
                  className="absolute -top-2 -right-2 text-white rounded-md 
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
          </Stack>

          <AnimatePresence>
            {activeFilterCount > 0 && (
              <motion.div className="mt-8 leading-tight">
                <ViewSummary items={summaries} />
              </motion.div>
            )}
          </AnimatePresence>
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
