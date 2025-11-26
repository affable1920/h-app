import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import SelectFilter from "./SelectFilter";
import Input from "../common/Input";

import Badge from "../common/Badge";
import Button from "../common/Button";
import CategoryFilter from "./CategoryFilter";

import { AnimatePresence } from "motion/react";
import useModalStore from "@/stores/modalStore";

import * as constants from "../../utils/constants";
import type { CategoryFilters, Filters } from "./types";

type CategoryFilterKey = keyof CategoryFilters;

const categoryFilters: {
  label: CategoryFilterKey;
  options: string[] | number[];
}[] = [
  {
    label: "mode",
    options: ["online", "offline"],
  },
  {
    label: "rating",
    options: [2, 3, 4],
  },
];

const DirectoryFilter = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // filter state - for updating local state first,
  // then a single api call on apply click
  const [filters, setFilters] = useState<Partial<Filters>>(() =>
    Object.fromEntries(searchParams.entries())
  );

  useEffect(
    function () {
      setFilters(Object.fromEntries(searchParams.entries()));
    },
    [searchParams]
  );

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  function handleFilterUpdate<T extends keyof Filters>(
    key: T,
    value: Filters[T] | null
  ): void {
    setFilters((p) => ({ ...p, [key]: value }));
  }

  const handleSpecUpdate = useCallback(function (spec: string | null) {
    handleFilterUpdate("specialization", spec);
  }, []);

  const handleCategoryUpdate = useCallback(
    function <T extends CategoryFilterKey>(
      label: T,
      option: CategoryFilters[T]
    ) {
      if (filters?.[label] === option) {
        handleFilterUpdate(label, null);
        return;
      }

      handleFilterUpdate(label, option);
    },
    [filters]
  );

  const selectedSpecialization = filters?.["specialization"];

  async function applyFiltersHTTP() {
    // Required before applying filters -
    // curr directory
    // filters applied
    // access to directory hook

    const newParams = new URLSearchParams();

    for (const [key, val] of Object.entries(filters)) {
      console.info("adding filters: ", key, val);
      if (!val) continue;
      newParams.set(key, String(val));
    }

    try {
      setSearchParams(newParams);
      useModalStore.getState().closeModal();
    } catch (ex) {
      console.log(ex);
    }
  }

  return (
    <section className="flex flex-col h-full gap-8 p-4 relative text-sm">
      <div className="flex items-center justify-between">
        {activeFilterCount > 0 && (
          <div className="absolute top-0 right-0">
            <Button
              color="accent"
              variant="contained"
              onClick={() => setFilters({})}
              className="hover:underline underline-offset-2"
            >
              Clear all
            </Button>
            <Badge>{activeFilterCount}</Badge>
          </div>
        )}
      </div>
      <section className="flex flex-col gap-8 w-full grow">
        <div className="filter-div">
          <AnimatePresence mode="wait">
            {selectedSpecialization && (
              <Badge
                as="button"
                needsMotion={true}
                className="w-fit capitalize"
                on={() => !!selectedSpecialization}
                onClick={() => handleSpecUpdate(null)}
              >
                {selectedSpecialization}
              </Badge>
            )}
          </AnimatePresence>
          <SelectFilter
            label="specialization"
            options={constants.SPECIALIZATIONS}
            /*
            How bind in js works: (finally understood)
            bind creates a new fn below and attaches "specialization" as the key to it, now it's fixed

            and down inside function where it is passed as a prop, we only require one more arg: [the key].
            */
            onOptionSelect={handleSpecUpdate}
          />
        </div>

        <div className="filter-div">
          <Input
            type="range"
            name="distance"
            label="Filter by distance"
            onChange={(ev) =>
              handleFilterUpdate("distance", parseInt(ev.target.value))
            }
          />
          <div className="flex justify-between items-center italic font-bold">
            <span>1 km</span>
            <span>40 km</span>
          </div>
        </div>

        {categoryFilters.map((category) => (
          <CategoryFilter
            size="md"
            key={category.label}
            label={category.label}
            options={category.options}
            onOptionSelect={handleCategoryUpdate}
            optionIsSelected={filters?.[category.label] ?? undefined}
          />
        ))}

        <Badge
          onClick={() =>
            handleFilterUpdate(
              "currently_available",
              (function (p) {
                return !p;
              })(filters?.currently_available)
            )
          }
          className="max-w-fit italic"
        >
          Available right now !
          <Input
            readOnly
            type="checkbox"
            name="availability"
            className="cursor-pointer"
            checked={!!filters?.currently_available}
          />
        </Badge>
      </section>

      <div className="flex items-center gap-4 justify-end">
        <Button
          size="md"
          variant="outlined"
          onClick={useModalStore.getState().closeModal}
        >
          Cancel
        </Button>
        <Button size="md" variant="outlined" onClick={applyFiltersHTTP}>
          Apply
        </Button>
      </div>
    </section>
  );
};

export default DirectoryFilter;
