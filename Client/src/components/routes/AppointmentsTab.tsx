import { useEffect, useRef, useState, type ReactNode } from "react";
import DirectoryLayout from "@/components/lib/DirectoryLayout";
import Pagination from "@/components/Pagination";
import Button from "@/components/lib/button/Button";
import SearchBar from "@/components/ui/SearchBar";
import { Stack } from "@/components/ui/Stack";
import Badge from "@/components/ui/Badge";
import {
  ArrowDownAZ,
  ArrowUpAZ,
  Calendar,
  Check,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { cn } from "@/utils/utils";
import { AnimatePresence, motion, stagger } from "motion/react";
import { createStagger } from "@/utils/motion-variants";
import { APPOINTMENT_STATUSES, statusPresentation } from "@/utils/constants";
import { useFilters } from "@/hooks/use-filters";
import { getClassConfig } from "../lib/button/styles";

export function AppointmentsTab({
  children,
  hasNext = false,
}: {
  children: ReactNode;
  hasNext?: boolean;
}) {
  const {
    page,
    appointmentStatus,
    activeFiltersCount,
    searchQuery,
    sortColumn,
    sortOrder,
    reset,
    handlePageChange,
    setFilter,
  } = useFilters();

  const viewSummary = Boolean(appointmentStatus || sortColumn);

  const [showOptions, setShowOptions] = useState<"filter" | "sort" | null>(
    null,
  );

  const sortRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(function () {
    function handleMouseDown(ev: MouseEvent) {
      const el = sortRef.current;

      if (!el) {
        return;
      }

      if (!el.contains(ev.target as Node)) {
        setShowOptions((p) => (p === "sort" ? null : p));
      }
    }

    document.addEventListener("mousedown", handleMouseDown);

    return function () {
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

  return (
    <DirectoryLayout className="space-y-8">
      <DirectoryLayout.Header className="justify-between">
        <Stack align="center" className="relative">
          <Button
            data-tooltip="filter"
            aria-label={"filter appointments"}
            variant="icon"
            bg={true}
            onClick={function () {
              setShowOptions((p) => (p === "filter" ? null : "filter"));
            }}
          >
            <SlidersHorizontal />
          </Button>

          <Button
            data-tooltip="sort"
            aria-label={"sort appointments"}
            variant="icon"
            bg={true}
            onClick={function () {
              setShowOptions((p) => (p === "sort" ? null : "sort"));
              timerRef.current = setTimeout(function () {
                setShowOptions((p) => (p === "sort" ? null : p));
              }, 1000);
            }}
          >
            <ArrowUpAZ />
          </Button>

          {activeFiltersCount > 0 && (
            <Button
              data-tooltip="clear all"
              aria-label="clear appointment search, filters, and sorting"
              variant="icon"
              bg={true}
              type="reset"
              onClick={function () {
                reset();
              }}
            >
              <X />
            </Button>
          )}

          <AnimatePresence mode="sync">
            {showOptions === "sort" && (
              <motion.div
                ref={sortRef}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                onMouseEnter={function () {
                  if (timerRef.current) {
                    clearTimeout(timerRef.current);
                  }
                }}
                onMouseLeave={function () {
                  timerRef.current = setTimeout(function () {
                    setShowOptions((p) => (p === "sort" ? null : p));
                  }, 300);
                }}
                className="absolute top-0 z-10 left-22"
              >
                <div
                  className="p-2 bg-layout rounded-lg shadow-lg shadow-black/30 border 
              border-border-vivid text-sm space-y-3"
                >
                  <motion.div
                    layout
                    animate={{
                      justifyContent: sortColumn ? "space-between" : "center",
                    }}
                    className="flex items-center border-b border-b-border-vivid p-2 mb-4"
                  >
                    {sortOrder === "asc" ? (
                      <motion.button
                        className={cn(
                          getClassConfig({ variant: "icon", size: "xs" }),
                        )}
                        data-tooltip="sort descending"
                        disabled={!sortColumn}
                        onClick={function () {
                          setFilter("sortOrder", "desc");
                        }}
                      >
                        DESC <ArrowUpAZ />
                      </motion.button>
                    ) : (
                      <motion.button
                        className={cn(
                          getClassConfig({ variant: "icon", size: "xs" }),
                        )}
                        disabled={!sortColumn}
                        onClick={function () {
                          setFilter("sortOrder", "asc");
                        }}
                        data-tooltip="sort ascending"
                      >
                        ASC <ArrowDownAZ />
                      </motion.button>
                    )}
                    {sortColumn && (
                      <motion.div
                        initial={{ y: 4 }}
                        animate={{ y: 0 }}
                        exit={{ y: 2 }}
                        className="flex justify-center"
                      >
                        <Button
                          variant="icon"
                          size="xs"
                          color="secondary"
                          data-tooltip="clear sort"
                          aria-label="clear sort filters"
                          onClick={function () {
                            reset({
                              sortColumn: true,
                              sortOrder: true,
                            });
                          }}
                        >
                          <X />
                        </Button>
                      </motion.div>
                    )}
                  </motion.div>
                  <motion.div
                    variants={createStagger({ exitDelay: true }).parent}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="space-y-2"
                  >
                    {[
                      { label: "date booked", icon: Calendar },
                      { label: "date scheduled", icon: Calendar },
                    ].map(function ({ label, icon: Icon }) {
                      return (
                        <motion.article
                          variants={createStagger().children}
                          className="flex items-center justify-between"
                          key={label}
                        >
                          <button
                            className="appearance-none leading-tight capitalize whitespace-nowrap
                              flex items-center gap-2 w-full p-2 justify-between cursor-pointer
                              hover:bg-layout-raised rounded-lg transition-colors duration-200 flex-1 min-w-0"
                            onClick={function () {
                              setFilter("sortColumn", label);
                            }}
                          >
                            <span className="inline-flex items-center gap-2 shrink-0">
                              <Icon size={10} />
                              {label}
                            </span>
                            <motion.span
                              animate={{
                                opacity: sortColumn === label ? 1 : 0,
                              }}
                              className="inline-flex items-center gap-2"
                            >
                              <Check size={10} />
                            </motion.span>
                          </button>
                        </motion.article>
                      );
                    })}
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Stack>
        <Stack>
          <SearchBar
            id="appointments-search"
            aria-label="search appointments"
            size="xs"
            value={searchQuery ?? ""}
            onChange={function (ev) {
              setFilter("searchQuery", ev);
            }}
            clearable={true}
            onClear={function () {
              reset({ searchQuery: true });
            }}
            placeholder="Search for appointments ..."
          />
        </Stack>
      </DirectoryLayout.Header>

      <DirectoryLayout.Content>
        <AnimatePresence>
          {showOptions === "filter" && (
            <motion.div
              variants={createStagger({ exitDelay: true }).parent}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{
                delayChildren: stagger(0.75, {
                  startDelay: 0.25,
                }),
              }}
            >
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: "auto", marginBottom: "20px" }}
                exit={{ height: 0, marginBottom: 0 }}
                className="flex gap-5 items-center"
              >
                <Stack align="center" gap={10}>
                  {APPOINTMENT_STATUSES.map(function (status) {
                    return (
                      <motion.span
                        key={status}
                        variants={createStagger().children}
                      >
                        <Badge
                          as="button"
                          onClick={function () {
                            setFilter("appointmentStatus", status);
                          }}
                          className={cn(
                            "text-center",
                            statusPresentation[status].classes,
                            status === appointmentStatus &&
                              "ring-2 ring-current/30",
                          )}
                        >
                          {status}
                        </Badge>
                      </motion.span>
                    );
                  })}
                </Stack>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {viewSummary && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto", marginBottom: "20px" }}
              exit={{
                height: 0,
                marginBottom: 0,
                transition: {
                  when: "beforeChildren",
                  duration: 0.1,
                },
              }}
              className="flex justify-end"
            >
              <motion.article
                role="status"
                aria-live="polite"
                aria-atomic="true"
                initial={{ y: "30px" }}
                animate={{ y: 0 }}
                exit={{
                  y: "20px",
                  transition: {
                    y: {
                      duration: 0.1,
                      ease: "easeIn",
                    },
                    marginBottom: {
                      duration: 0.2,
                      ease: "easeOut",
                    },
                  },
                }}
                transition={{
                  ease: "easeOut",
                  duration: 0.2,
                }}
                className="italic space-y-1.5 text-right"
              >
                Viewing{" "}
                {appointmentStatus && (
                  <span>
                    Status:{" "}
                    <span
                      className={cn(
                        "px-2 py-[0.25] rounded-md text-sm ring-1 inline-flex ring-current/30 mx-1",
                        statusPresentation[appointmentStatus].classes,
                      )}
                    >
                      {appointmentStatus}
                    </span>
                  </span>
                )}
                <br />
                {sortColumn && (
                  <span>
                    Sorted by:{" "}
                    <span
                      className={cn(
                        "inline-flex px-2 py-[0.25] rounded-md text-sm ring-1 ring-current/30 mx-1",
                      )}
                    >
                      {sortColumn}
                    </span>{" "}
                    from:{" "}
                    <span
                      className={cn(
                        "inline-flex px-2 py-[0.25] rounded-md text-sm ring-1 ring-current/30 mx-1",
                      )}
                    >
                      {sortOrder === "desc"
                        ? "recents first"
                        : "earliest first"}
                    </span>
                  </span>
                )}
              </motion.article>
            </motion.div>
          )}
        </AnimatePresence>

        <section>{children}</section>
      </DirectoryLayout.Content>

      <DirectoryLayout.Footer>
        <Pagination
          currentPage={page}
          hasNext={hasNext}
          onPageChange={handlePageChange}
        />
      </DirectoryLayout.Footer>
    </DirectoryLayout>
  );
}
