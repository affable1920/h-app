import useModalStore from "@/stores/modal-store";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import Badge from "@/components/ui/Badge";
import Button from "./ui/Button";
import SelectFilter from "./ui/SelectFilter";
import * as constants from "@/utils/constants";
import { useSearchParams } from "react-router-dom";
import useFilterStore, { type FilterState } from "@/stores/filter-store";
import { Stack } from "./ui/Stack";
import Ratings from "./Ratings";
import { ArrowDownAZ, Mars, SlidersHorizontal, Venus } from "lucide-react";
import { toast } from "sonner";
import StepInput from "./ui/StepInput";
import { debounce } from "@/utils/utils";
import { AnimatePresence, motion, stagger } from "motion/react";

const labelFilters = "text-text-normal capitalize text-center";
type NumericFilterKey = Extract<keyof FilterState, "experience" | "fee">;

function DirectoryFilter() {
  const [, setSearchParams] = useSearchParams();
  const {
    filters,
    handleFilterUpdate,
    reset,
    allUpdatesFlushed,
    clearField,
    activeFiltersCount,
  } = useFilterStore();

  const closeModal = useModalStore((s) => s.closeModal);
  const experienceRef = useRef<HTMLInputElement>(null);
  const feeRef = useRef<HTMLInputElement>(null);

  const [showSorter, setShowSorter] = useState(false);

  useEffect(
    function () {
      if (!!filters.sortBy) {
        setShowSorter(true);
      }
    },
    [filters.sortBy, showSorter],
  );

  const update = useCallback(
    // extends handleFilterUpdate and adds toggle functionality for a given param
    function <K extends keyof FilterState>(key: K, val: FilterState[K]) {
      if (filters[key] === val) {
        clearField(key);
        return;
      }

      handleFilterUpdate(key, val);
    },
    [filters],
  );

  const selectedSpecialization = filters.specialization ?? null;

  useEffect(
    function () {
      if (experienceRef.current) {
        experienceRef.current.value = !!filters.experience
          ? String(filters.experience)
          : "-";
      }

      if (feeRef.current) {
        feeRef.current.value = !!filters.fee ? String(filters.fee) : "-";
      }
    },
    [filters.experience, filters.fee],
  );

  async function applyFiltersHttp() {
    const newParams = new URLSearchParams();

    for (const [key, val] of Object.entries(filters)) {
      if (!val) {
        continue;
      }

      newParams.set(key, String(val));
    }

    try {
      setSearchParams(newParams);
      closeModal();
    } catch (ex) {
      console.log(ex);
    }
  }

  const debounced = useRef(debounce(update, 200)).current;

  function handleFilterChange<K extends NumericFilterKey>(
    key: K,
    op: "inc" | "dec",
  ) {
    const el = key === "experience" ? experienceRef.current : feeRef.current;

    if (!el) {
      return;
    }

    if (op === "inc") {
      if (Number(el.value) === Number(el.max)) {
        return;
      }

      el.stepUp();
      debounced(key, Number(el.value)); // el.value after stepUp is the incremented val here
    }

    if (op === "dec") {
      const minReached =
        !el.value.trim() || Number(el.value) === 1 || Number(el.value) === 0;

      if (minReached) {
        el.value = "-";
        clearField(key);
        return;
      } else {
        el.stepDown();
        debounced(key, Number(el.value));
      }
    }
  }

  function isNumericKey(id: string): id is NumericFilterKey {
    return id === "experience" || id === "fee";
  }

  function handleFilterInput(ev: ChangeEvent<HTMLInputElement>) {
    const id = ev.target.id;
    if (!isNumericKey(id)) {
      return;
    }

    const el = id === "fee" ? feeRef.current : experienceRef.current;

    if (!el) {
      return;
    }

    const val = ev.target.value;

    if (val.startsWith("-")) {
      el.value = "-";
      clearField(id);
      toast.warning(el.id + " can not be negative!", {
        className: "capitalize",
      });
      return;
    }

    if (Number(val) > Number(el.max)) {
      el.value = "-";
      clearField(id);
      toast.warning(el.id + " can not be greater than " + el.max, {
        className: "capitalize",
      });
      return;
    }

    el.value = val;
    update(id, Number(val));
  }

  return (
    <section className="h-full flex flex-col gap-8 py-6">
      <Stack justify="between" className="px-6">
        <Button
          variant="icon"
          disabled
          color="secondary"
          className="disabled:opacity-75 disabled:shadow-xs"
          bg={true}
        >
          <SlidersHorizontal />
        </Button>

        <Button
          onClick={function () {
            setShowSorter((p) => !p);
          }}
          variant="icon"
          bg={true}
          color="secondary"
        >
          <ArrowDownAZ />
        </Button>
      </Stack>

      <Stack
        orientation="H"
        className="grow relative px-6 py-6 overflow-y-scroll overflow-x-hidden"
        style={{ scrollbarWidth: "none", scrollBehavior: "smooth" }}
      >
        <Stack gap="lg" orientation="V">
          <div>
            {selectedSpecialization && (
              <Badge
                as="button"
                className="max-w-fit capitalize mb-2"
                selected={!!selectedSpecialization}
                onClick={function () {
                  clearField("specialization");
                }}
              >
                {selectedSpecialization}
              </Badge>
            )}
            <SelectFilter
              label="filter by specialization"
              options={constants.SPECIALIZATIONS}
              onOptionSelect={update.bind(filters, "specialization")}
            />
          </div>

          <Stack orientation="V" gap="sm">
            <p className={labelFilters}>
              filter by{" "}
              <em>
                <strong>rating</strong>
              </em>
            </p>
            <Stack orientation="H" style={{ flexWrap: "wrap" }}>
              {[2, 3, 4].map(function (option) {
                return (
                  <Badge
                    full={false}
                    key={option}
                    className="grow"
                    size="sm"
                    selected={option === filters.minRating}
                    onClick={function () {
                      update("minRating", option);
                    }}
                  >
                    <Ratings rating={option as number} />
                  </Badge>
                );
              })}
            </Stack>
          </Stack>

          <Stack orientation="V" gap="sm">
            <p className={labelFilters}>Availability</p>
            <Badge
              selected={filters.currentlyAvailable === "1"}
              className={`font-semibold`}
              onClick={function () {
                update("currentlyAvailable", "1");
              }}
            >
              Doctors Online Now !
            </Badge>
          </Stack>

          <Stack orientation="V">
            <p className={labelFilters}>Gender</p>
            <Stack justify="between">
              {Object.entries({ male: <Mars />, female: <Venus /> }).map(
                function ([gender, icon]) {
                  return (
                    <Badge
                      className="[&>svg]:size-4 items-center gap-2 capitalize"
                      selected={gender === filters.gender}
                      onClick={function () {
                        update("gender", gender as FilterState["gender"]);
                      }}
                      key={gender}
                    >
                      {gender} {icon}
                    </Badge>
                  );
                },
              )}
            </Stack>
          </Stack>

          <Stack
            orientation="H"
            gap="lg"
            style={{ flexWrap: "wrap" }}
            justify="center"
          >
            <StepInput
              label="min experience"
              stepUp={function () {
                handleFilterChange("experience", "inc");
              }}
              stepDown={function () {
                handleFilterChange("experience", "dec");
              }}
              ref={experienceRef}
              onChange={handleFilterInput}
              id="experience"
              placeholder="-"
              min="0"
              max="60"
              step="1"
            />

            <StepInput
              label="max fee"
              stepUp={function () {
                handleFilterChange("fee", "inc");
              }}
              stepDown={function () {
                handleFilterChange("fee", "dec");
              }}
              onChange={handleFilterInput}
              ref={feeRef}
              id="fee"
              placeholder="-"
              min="0"
              max="800"
              step="50"
            />
          </Stack>
        </Stack>

        <AnimatePresence>
          {showSorter && (
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: showSorter ? "auto" : 0,
              }}
              exit={{ width: 0 }}
            >
              <motion.div
                initial={{ x: "40px", opacity: 0 }}
                animate={{
                  x: 0,
                  opacity: 1,
                  transition: {
                    delayChildren: stagger(0.125, { startDelay: 0.5 }),
                    ease: "easeOut",
                  },
                }}
                exit={{
                  x: "20px",
                  opacity: 0,
                }}
                className="flex flex-col gap-2 whitespace-nowrap"
              >
                {Object.entries({
                  name: "asc",
                  rating: "desc",
                  reviews: "desc",
                  experience: "desc",
                  fee: "asc",
                } as Record<string, FilterState["sortOrder"]>).map(function ([
                  col,
                  order,
                ]) {
                  return (
                    <Button
                      onClick={function () {
                        update("sortBy", col);
                        update(
                          "sortOrder",
                          !!filters.sortOrder
                            ? filters.sortOrder === "asc"
                              ? "desc"
                              : "asc"
                            : order,
                        );
                      }}
                      size="sm"
                      needsMotion={true}
                      variant="icon"
                      bg={true}
                      color={filters.sortBy === col ? "white" : "secondary"}
                      key={col}
                      className="capitalize text-xs"
                    >
                      {col}
                    </Button>
                  );
                })}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </Stack>

      <Stack justify="end" align="end" className="px-6">
        {!!activeFiltersCount && (
          <Button size="sm" onClick={reset} color="warning">
            Reset
          </Button>
        )}
        <Button
          variant="ghost"
          className="shadow-sm shadow-black/20 border-border-vivid border-2"
          onClick={closeModal}
        >
          Cancel
        </Button>
        <Button
          disabled={allUpdatesFlushed}
          color="white"
          onClick={applyFiltersHttp}
        >
          Apply
        </Button>
      </Stack>
    </section>
  );
}

export default DirectoryFilter;
