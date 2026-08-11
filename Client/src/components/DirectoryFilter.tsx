import useModalStore from "@/stores/modal-store";
import { useCallback, useEffect, useRef, useState } from "react";
import Badge from "@/components/ui/Badge";
import Button from "./ui/Button";
import SelectFilter from "./ui/SelectFilter";
import * as constants from "@/utils/constants";
import { useSearchParams } from "react-router-dom";
import useFilterStore, { type FilterState } from "@/stores/filter-store";
import { Stack } from "./ui/Stack";
import Ratings from "./Ratings";
import {
  ArrowDownAZ,
  Mars,
  ShieldCheck,
  SlidersHorizontal,
  Venus,
} from "lucide-react";
import StepInput, { type StepHandle } from "./ui/StepInput";
import { AnimatePresence, motion, stagger } from "motion/react";

const labelStyle = "text-text-normal capitalize text-center";

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
  const experienceRef = useRef<StepHandle>(null);
  const feeRef = useRef<StepHandle>(null);

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
      if (experienceRef.current && filters.experience) {
        experienceRef.current.val = filters.experience;
      }

      if (feeRef.current && filters.fee) {
        feeRef.current.val = filters.fee;
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
            setShowSorter(function (p) {
              return !p;
            });
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
              onOptionSelect={function (option) {
                update("specialization", option as string);
              }}
            />
          </div>

          <Stack orientation="V" gap="sm">
            <p className={labelStyle}>
              filter by{" "}
              <em>
                <strong>rating</strong>
              </em>
            </p>
            <Stack orientation="H" gap={12} style={{ flexWrap: "wrap" }}>
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
            <p className={labelStyle}>Availability</p>
            <Badge
              selected={filters.currentlyAvailable === "1"}
              className={`font-semibold`}
              onClick={function () {
                update("currentlyAvailable", "1");
              }}
            >
              Doctors Online Now
            </Badge>
          </Stack>

          <Stack orientation="V" gap="sm">
            <Stack justify="center" align="center">
              <p className={labelStyle}>Verfied</p>
              <ShieldCheck size={13} color="teal" />
            </Stack>
            <Badge
              className={`font-semibold`}
              onClick={function () {
                update("currentlyAvailable", "1");
              }}
            >
              Verified Doctors only
            </Badge>
          </Stack>

          <Stack orientation="V">
            <p className={labelStyle}>Gender</p>
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
              label="min experience (years)"
              onStepUp={function (val) {
                experienceRef.current?.stepUp();
                update("experience", (filters.experience ?? 0) + val);
              }}
              onStepDown={function (val) {
                experienceRef.current?.stepDown();
                update("experience", (filters.experience ?? 0) - val);
              }}
              ref={experienceRef}
              onChange={experienceRef.current?.handleChange}
              id="experience"
              placeholder="-"
              min="0"
              max="60"
              step="1"
            />

            <StepInput
              label="max fee"
              onStepUp={function (val) {
                feeRef.current?.stepUp();
                update("experience", (filters.fee ?? 0) + val);
              }}
              onStepDown={function (val) {
                feeRef.current?.stepDown();
                update("experience", (filters.fee ?? 0) - val);
              }}
              onChange={feeRef.current?.handleChange}
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
