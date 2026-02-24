import { useCallback, useEffect, useState } from "react";

import useModalStore from "@/stores/modalStore";
import Badge from "@components/common/Badge";
import { AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import Button from "../common/Button";
import Input from "../common/Input";
import CategoryFilter from "./CategoryFilter";
import SelectFilter from "./SelectFilter";

import * as constants from "@/utils/constants";
import { useSearchParams } from "react-router-dom";
import type { paths } from "@/types/api";

const RATINGFILTER = {
  label: "rating",
  options: [2, 3, 4],
};

type FilterState = Omit<
  NonNullable<paths["/doctors"]["get"]["parameters"]["query"]>,
  "max" | "page" | "sortBy" | "sortOrder" | "searchQuery"
>;

type FilterKey = keyof FilterState;

const DirectoryFilter = () => {
  const [filters, setFilters] = useState<Partial<FilterState>>({});
  const [searchParams, setSearchParams] = useSearchParams();

  function reset() {
    setFilters({});
  }

  useEffect(function () {
    setFilters({
      minRating: Number(searchParams.get("minRating")),
      specialization: searchParams.get("specialization"),
      maxDistance: Number(searchParams.get("maxDistance")),
      mode: searchParams.get("mode") === "online" ? "online" : null,
      currentlyAvailable: searchParams.get("currentlyAvailable") === "true",
    });
  }, []);

  function handleFilterUpdate<K extends FilterKey>(
    key: K,
    val: FilterState[K],
  ) {
    if (filters[key] === val) {
      setFilters((p) => ({ ...p, [key]: undefined }));
      return;
    }

    setFilters((prev) => ({ ...prev, [key]: val }));
  }

  const selectedSpecialization = filters.specialization ?? null;

  const handleSpecUpdate = useCallback(function (spec: string | null) {
    handleFilterUpdate("specialization", spec);
  }, []);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;
  const closeModal = useModalStore((s) => s.closeModal);

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
      closeModal();
    } catch (ex) {
      console.log(ex);
    }
  }

  return (
    <section className="flex flex-col h-full gap-8 p-4 px-6 relative text-xs">
      <div className="flex items-center justify-between">
        {activeFilterCount > 0 && (
          <div className="ml-auto flex items-center gap-2">
            <p>{activeFilterCount}</p>
            <Button
              className="p-2"
              variant="ghost"
              color="secondary"
              onClick={reset}
            >
              <X />
            </Button>
          </div>
        )}
      </div>
      <section className="flex flex-col gap-8 w-full grow">
        <div className="filter-div">
          <AnimatePresence mode="wait">
            {selectedSpecialization && (
              <Badge
                as="button"
                size="md"
                className="max-w-fit capitalize"
                selected={!!selectedSpecialization}
                onClick={() => handleSpecUpdate(null)}
              >
                {selectedSpecialization}
              </Badge>
            )}
          </AnimatePresence>
          <SelectFilter
            label="specialization"
            options={constants.SPECIALIZATIONS}
            onOptionSelect={handleSpecUpdate}
          />
        </div>

        <div className="filter-div">
          <label>Filter by distance</label>
          <Input
            type="range"
            name="distance"
            onChange={(ev) =>
              handleFilterUpdate("maxDistance", parseInt(ev.target.value))
            }
          />
          <div className="flex justify-between items-center italic font-bold">
            <span>1 km</span>
            <span>40 km</span>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <CategoryFilter
            size="md"
            options={RATINGFILTER.options}
            label={"Filter by " + RATINGFILTER.label}
            selectedOption={filters["minRating"] ?? undefined}
            onOptionSelect={handleFilterUpdate.bind(null, "minRating")}
          />
          <Badge
            size="md"
            className="italic max-w-fit ml-auto"
            selected={filters.currentlyAvailable}
            onClick={() => handleFilterUpdate("currentlyAvailable", true)}
          >
            Available right now !
          </Badge>

          <Badge
            size="md"
            selected={filters.mode === "online"}
            className="italic max-w-fit ml-auto"
            onClick={() => handleFilterUpdate("mode", "online")}
          >
            Online
          </Badge>
        </div>
      </section>

      <div className="flex items-center gap-4 justify-end">
        <Button
          size="md"
          onClick={function () {
            reset();
            closeModal();
          }}
        >
          Cancel
        </Button>
        <Button size="md" color="accent" onClick={applyFiltersHTTP}>
          Apply
        </Button>
      </div>
    </section>
  );
};

export default DirectoryFilter;
