import useModalStore from "@/stores/modalStore";
import Badge from "@/components/ui/Badge";
import { AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import Button from "./ui/Button";
import Input from "./ui/Input";
import CategoryFilter from "./CategoryFilter";
import SelectFilter from "./ui/SelectFilter";

import * as constants from "@/utils/constants";
import { useSearchParams } from "react-router-dom";
import useFilterStore from "@/stores/filterStore";
import { Stack } from "./ui/Stack";

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
    <section className="flex flex-col h-full gap-8 p-4 px-6 relative">
      <div className="flex items-center justify-between">
        {!!activeFiltersCount && (
          <div className="ml-auto flex items-center gap-2">
            <p>{activeFiltersCount}</p>
            <Button className="p-2" variant="icon" onClick={reset}>
              <X />
            </Button>
          </div>
        )}
      </div>
      <Stack className="grow" gap="lg" orientation="V">
        <div className="space-y-2">
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

        <div>
          <label className="text-text-normal">Filter by distance</label>
          <Input
            type="range"
            name="distance"
            onChange={function (ev) {
              handleFilterUpdate("maxDistance", parseInt(ev.target.value));
            }}
          />
          <Stack justify="between">
            <span>1 km</span>
            <span>40 km</span>
          </Stack>
        </div>

        <Stack orientation="V">
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
        </Stack>
      </Stack>

      <div className="flex items-center gap-4 justify-end">
        <Button
          variant="ghost"
          className="shadow-md shadow-black/20 border-border-vivid border-2"
          onClick={function () {
            reset();
            closeModal();
          }}
        >
          Cancel
        </Button>
        <Button color="brand" onClick={applyFiltersHTTP}>
          Apply
        </Button>
      </div>
    </section>
  );
}

export default DirectoryFilter;
