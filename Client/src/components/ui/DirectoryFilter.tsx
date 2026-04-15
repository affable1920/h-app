import useModalStore from "@/stores/modalStore";
import Badge from "@/components/ui/Badge";
import { AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import Button from "./Button";
import Input from "./Input";
import CategoryFilter from "./CategoryFilter";
import SelectFilter from "./SelectFilter";

import * as constants from "@/utils/dataConstants";
import { useSearchParams } from "react-router-dom";
import useFilterStore from "@/stores/filterStore";

const RATINGFILTER = {
  label: "rating",
  options: [2, 3, 4],
};

function DirectoryFilter() {
  const { filters, handleFilterUpdate, activeFiltersCount, reset } =
    useFilterStore();
  const [, setSearchParams] = useSearchParams();

  const handleSpecUpdate = handleFilterUpdate.bind(filters, "specialization");

  const closeModal = useModalStore((s) => s.closeModal);

  const selectedSpecialization = filters.specialization ?? null;

  async function applyFiltersHTTP() {
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
    <section className="flex flex-col h-full gap-8 p-4 px-6 relative text-xs">
      <div className="flex items-center justify-between">
        {!!activeFiltersCount && (
          <div className="ml-auto flex items-center gap-2">
            <p>{activeFiltersCount}</p>
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
            onChange={function (ev) {
              handleFilterUpdate("maxDistance", parseInt(ev.target.value));
            }}
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
            selected={filters.currentlyAvailable === "1"}
            className="italic max-w-fit ml-auto"
            onClick={handleFilterUpdate.bind(null, "currentlyAvailable", "1")}
          >
            Online Now
          </Badge>
        </div>
      </section>

      <div className="flex items-center gap-4 justify-end">
        <Button
          size="md"
          color="secondary"
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
}

export default DirectoryFilter;
