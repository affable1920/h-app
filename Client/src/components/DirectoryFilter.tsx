import useModalStore from "@/stores/modal-store";
import { useEffect, useMemo, useState } from "react";
import Badge from "@/components/ui/Badge";
import Button from "./ui/Button";
import SelectFilter from "./ui/SelectFilter";
import * as constants from "@/utils/constants";
import { useSearchParams } from "react-router-dom";
import { Stack } from "./ui/Stack";
import Ratings from "./Ratings";
import {
  ArrowDownAZ,
  Mars,
  ShieldCheck,
  SlidersHorizontal,
  Venus,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Divider from "./ui/Divider";
import { Controller } from "react-hook-form";
import {
  useFilterStore,
  EMPTY_FILTERS,
  type FilterState,
} from "@stores/filter-store";
import { ControlledStepInput } from "./ui/ControlledStepInput";

const labelStyle = "text-text-normal capitalize text-center";

const SORT_COLS = {
  name: "asc",
  rating: "desc",
  reviews: "desc",
  experience: "desc",
  fee: "asc",
};

function DirectoryFilter() {
  const [, setSearchParams] = useSearchParams();
  const closeModal = useModalStore((s) => s.closeModal);
  const [showSorter, setShowSorter] = useState(false);

  const { setValue, resetField, getValues, control, ...form } =
    useFilterStore();

  const so = form.watch("sortColumn");

  useEffect(
    function () {
      if (so) {
        setShowSorter(true);
      }
    },
    [so],
  );

  const fields = form.watch();

  const hasActiveFilters = useMemo(
    function () {
      return Object.values(fields).some(function (v) {
        return Boolean(v);
      });
    },
    [fields],
  );

  async function applyFiltersHttp() {
    const newParams = new URLSearchParams();

    for (const [key, val] of Object.entries(getValues())) {
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
          aria-label="filter-opener"
        >
          <SlidersHorizontal />
        </Button>

        <Button
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
        className="grow relative px-8 py-6 overflow-y-scroll"
        style={{ scrollbarWidth: "none", scrollBehavior: "smooth" }}
      >
        <AnimatePresence mode="wait">
          {showSorter && (
            <motion.div
              className="flex flex-col gap-4"
              initial={{ height: 0, marginBottom: 0 }}
              animate={{ height: "auto", marginBottom: "32px" }}
              exit={{ height: 0, marginBottom: 0 }}
            >
              <Stack justify="between" align="center" className="relative">
                <p className={labelStyle + " mx-auto"}>Sort by</p>
                {so && (
                  <Button
                    onClick={function () {
                      form.reset(
                        {
                          sortColumn: null,
                          sortOrder: undefined,
                        },
                        { keepDefaultValues: true },
                      );
                    }}
                    aria-label="clear-sort"
                    size="sm"
                    variant="icon"
                    className="absolute right-2 underline-offset-2 hover:underline hover:text-blue-500 
                    transition-colors"
                  >
                    clear
                  </Button>
                )}
              </Stack>
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
                className="flex flex-wrap gap-2"
              >
                {Object.entries(
                  SORT_COLS as Record<string, FilterState["sortOrder"]>,
                ).map(function ([col, order]) {
                  return (
                    <Button
                      aria-selected={col === fields.sortColumn}
                      onClick={function () {
                        const sc = col === fields.sortColumn ? null : col;
                        setValue("sortColumn", sc, {
                          shouldDirty: true,
                        });
                        setValue("sortOrder", order, {
                          shouldDirty: true,
                        });
                      }}
                      key={col}
                      size="sm"
                      variant="icon"
                      bg={true}
                      color={col === fields.sortColumn ? "white" : "secondary"}
                      needsMotion={true}
                      className="text-xs capitalize grow"
                    >
                      {col}
                    </Button>
                  );
                })}
              </motion.div>
              <Divider />
            </motion.div>
          )}
        </AnimatePresence>
        <Stack gap="md" orientation="V">
          <div>
            {getValues("specialization") && (
              <Badge
                as="button"
                className="max-w-fit capitalize mb-2"
                selected={true}
                onClick={function () {
                  form.reset(
                    {
                      specialization: null,
                    },
                    {
                      keepDefaultValues: true,
                    },
                  );
                }}
              >
                {getValues("specialization")}
              </Badge>
            )}
            <SelectFilter
              label="filter by specialization"
              options={constants.SPECIALIZATIONS}
              onOptionSelect={function (option) {
                setValue("specialization", option as string, {
                  shouldDirty: true,
                });
              }}
            />
          </div>

          <Stack orientation="V">
            <p className={labelStyle}>
              filter by{" "}
              <em>
                <strong>rating</strong>
              </em>
            </p>

            <Stack
              orientation="H"
              gap={10}
              style={{
                flexWrap: "wrap",
              }}
            >
              {[2, 3, 4].map(function (rating) {
                return (
                  <Badge
                    full={false}
                    className="grow"
                    selected={rating === fields.minRating}
                    onClick={function () {
                      setValue(
                        "minRating",
                        rating === fields.minRating ? null : rating,
                        {
                          shouldDirty: true,
                        },
                      );
                    }}
                  >
                    <Ratings rating={rating} />
                  </Badge>
                );
              })}
            </Stack>
          </Stack>

          <Stack orientation="V">
            <Stack justify="center" gap={4} align="center">
              <p className={labelStyle}>Verfication</p>
              <ShieldCheck size={13} color="teal" />
            </Stack>
            <Badge
              selected={fields.verified === "1"}
              className={`font-semibold`}
              onClick={function () {
                setValue("verified", fields.verified === "1" ? null : "1", {
                  shouldDirty: true,
                });
              }}
            >
              Verified Doctors only
            </Badge>
          </Stack>

          <Stack orientation="V">
            <p className={labelStyle}>Gender</p>
            <Stack justify="between" gap="sm">
              {Object.entries({ male: <Mars />, female: <Venus /> }).map(
                function ([gender, icon]) {
                  const gdr = gender as FilterState["gender"];
                  return (
                    <Badge
                      className="[&>svg]:size-4 items-center gap-2 capitalize"
                      selected={gdr === fields.gender}
                      onClick={function () {
                        setValue("gender", gdr === fields.gender ? null : gdr, {
                          shouldDirty: true,
                        });
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

          <Controller
            name="experience"
            control={control}
            render={function ({ field: { onChange, ...field }, fieldState }) {
              return (
                <ControlledStepInput
                  label="min experience (years)"
                  id="experience"
                  placeholder="-"
                  min="0"
                  max="60"
                  step="1"
                  onChange={function (e) {
                    form.clearErrors(field.name);
                    onChange(e);
                  }}
                  onBlur={field.onBlur}
                  value={field.value ?? ""}
                  error={fieldState.error?.message}
                  onInvalid={function (msg) {
                    onChange(null);
                    if (msg !== "-") {
                      form.setError(field.name, {
                        message: msg,
                      });
                    }
                  }}
                />
              );
            }}
          />

          <Controller
            name="fee"
            control={control}
            render={function ({ field: { onChange, ...field }, fieldState }) {
              return (
                <ControlledStepInput
                  label="max fee"
                  id="fee"
                  placeholder="-"
                  min="0"
                  max="800"
                  step="50"
                  name={field.name}
                  onChange={function (e) {
                    form.clearErrors(field.name);
                    onChange(e);
                  }}
                  onBlur={field.onBlur}
                  value={field.value ?? ""}
                  error={fieldState.error?.message}
                  onInvalid={function (msg) {
                    onChange(null);
                    if (msg !== "-") {
                      form.setError(field.name, {
                        message: msg,
                      });
                    }
                  }}
                />
              );
            }}
          />
        </Stack>
      </Stack>

      <Stack align="end" justify="end" className="px-6 [&_button]:scale-90">
        {hasActiveFilters && (
          <Button
            onClick={function () {
              form.reset(EMPTY_FILTERS, { keepDefaultValues: true });
            }}
            color="indicator"
          >
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
          disabled={!form.formState.isDirty}
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
