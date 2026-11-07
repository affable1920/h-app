import { useState, type ReactNode } from "react";
import Button from "./lib/button/Button";
import { Stack } from "./ui/Stack";
import { ArrowDownAZ, ArrowUpAZ, SlidersHorizontal, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Divider from "./ui/Divider";
import { removeModal } from "@/stores/modal-store";
import Badge from "./ui/Badge";
import { cn } from "@/utils/utils";

interface DirectoryFilterProps {
  onReset: () => void;
  onApply: () => void;
  children: ReactNode;
  sortColumns: readonly string[];
  sortColumn: string | null;
  sortOrder: "asc" | "desc" | null;
  hasActiveFilters: boolean;
  isDirty: boolean;
  onClearSort: () => void;
  setSortColumn: (col: string) => void;
  setSortOrder: (order: "asc" | "desc") => void;
}

function DirectoryFilter({
  sortColumn,
  sortOrder,
  children,
  sortColumns,
  onClearSort,
  onReset,
  onApply,
  isDirty,
  setSortOrder,
  setSortColumn,
  hasActiveFilters,
}: DirectoryFilterProps) {
  const [showSorter, setShowSorter] = useState(Boolean(sortColumn));

  return (
    <section className="h-full flex flex-col gap-8 py-6">
      <Stack justify="between" className="px-6">
        <Button
          variant="icon"
          disabled
          color="secondary"
          className="disabled:opacity-75 disabled:shadow-xs"
          bg={true}
          aria-label="filter-opener"
        >
          <SlidersHorizontal />
        </Button>

        <Button
          data-tooltip="sort"
          onClick={function () {
            setShowSorter(function (p) {
              return !p;
            });
          }}
          aria-label="sorter-opener"
          variant="icon"
          bg={true}
          color="secondary"
        >
          <ArrowDownAZ />
        </Button>
      </Stack>

      <Stack
        orientation="V"
        gap={0}
        justify="center"
        className="grow relative overflow-y-scroll"
        style={{ scrollbarWidth: "none", scrollBehavior: "smooth" }}
      >
        <Stack className="px-8">
          <AnimatePresence mode="wait">
            {showSorter && (
              <motion.div
                className="flex flex-col gap-4"
                initial={{ height: 0, marginBottom: 0 }}
                animate={{ height: "auto", marginBottom: "32px" }}
                exit={{ height: 0, marginBottom: 0 }}
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  exit={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {sortColumn && (
                    <Stack
                      className="min-w-0 grow"
                      gap={"xs"}
                      align="center"
                      justify="end"
                    >
                      {sortOrder !== null && (
                        <Badge
                          as="button"
                          size="xs"
                          onClick={function () {
                            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                          }}
                          data-tooltip={`set sort order to ${sortOrder === "asc" ? "DESC" : "ASC"}`}
                          className="self-stretch gap-2 font-semibold px-2"
                        >
                          {sortOrder === "asc" ? (
                            <>
                              <ArrowDownAZ size={10} />
                              ASC
                            </>
                          ) : (
                            <>
                              <ArrowUpAZ size={10} /> DESC
                            </>
                          )}
                        </Badge>
                      )}

                      <Button
                        onClick={onClearSort}
                        aria-label="clear-sort"
                        size="xs"
                        variant="icon"
                        color="secondary"
                        bg={true}
                        data-tooltip="clear sort filters"
                        className="self-stretch"
                      >
                        <X />
                      </Button>
                    </Stack>
                  )}
                </motion.div>

                <motion.div
                  initial={{ y: "-20px", opacity: 0 }}
                  animate={{
                    y: 0,
                    opacity: 1,
                  }}
                  exit={{
                    y: "-10px",
                    opacity: 0,
                  }}
                  className="flex flex-wrap gap-2.5"
                >
                  {sortColumns.map(function (col) {
                    return (
                      <Button
                        aria-pressed={col === sortColumn}
                        onClick={function () {
                          setSortColumn(col);
                        }}
                        key={col}
                        variant="icon"
                        bg={true}
                        color={col === sortColumn ? "white" : "secondary"}
                        className={cn("text-xs capitalize grow")}
                      >
                        {col}
                      </Button>
                    );
                  })}
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Divider />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </Stack>

        <Stack className="grow px-8 py-4">{children}</Stack>
      </Stack>

      <Stack align="center" justify="end" className="px-6">
        {hasActiveFilters && (
          <Button
            onClick={function () {
              onReset();
            }}
            size="xs"
            color="indicator"
            type="reset"
          >
            Reset
          </Button>
        )}
        <Button size="xs" color="secondary" onClick={removeModal}>
          Cancel
        </Button>
        <Button
          size="xs"
          disabled={!isDirty}
          color="white"
          onClick={function () {
            onApply();
            removeModal();
          }}
        >
          Apply
        </Button>
      </Stack>
    </section>
  );
}

export default DirectoryFilter;
