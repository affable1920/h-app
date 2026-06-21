import useModalStore from "@/stores/modalStore";
import Badge from "@/components/ui/Badge";
import Button from "./ui/Button";
import SelectFilter from "./ui/SelectFilter";

import * as constants from "@/utils/constants";
import { useSearchParams } from "react-router-dom";
import useFilterStore from "@/stores/filterStore";
import { Stack } from "./ui/Stack";
import Ratings from "./Ratings";

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
    <section className="flex flex-col h-full gap-8 p-6 relative">
      <Stack className="grow" gap="lg" orientation="V">
        <div className="space-y-3">
          {selectedSpecialization && (
            <Badge
              as="button"
              className="max-w-fit capitalize"
              selected={!!selectedSpecialization}
              onClick={() => handleSpecUpdate(selectedSpecialization)}
            >
              {selectedSpecialization}
            </Badge>
          )}
          <SelectFilter
            label="filter by specialization"
            options={constants.SPECIALIZATIONS}
            onOptionSelect={handleSpecUpdate}
          />
        </div>

        <Stack orientation="V" gap="md">
          <Stack orientation="V">
            <p className="text-text-normal capitalize">filter by rating</p>
            <Stack>
              {RATINGFILTER.options.map((option) => (
                <Badge
                  selected={option === filters["minRating"]}
                  key={option}
                  onClick={function () {
                    handleFilterUpdate("minRating", option);
                  }}
                >
                  <Ratings rating={option as number} />
                </Badge>
              ))}
            </Stack>
          </Stack>

          <Badge
            selected={filters.currentlyAvailable === "1"}
            className={`italic max-w-fit ml-auto font-semibold`}
            onClick={function () {
              handleFilterUpdate("currentlyAvailable", "1");
            }}
          >
            Online Now
          </Badge>
        </Stack>
      </Stack>

      <div className="flex items-center gap-4 justify-end">
        {!!activeFiltersCount && (
          <Button onClick={reset} color="indicator">
            Reset
          </Button>
        )}
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
        <Button
          disabled={activeFiltersCount === 0}
          color="white"
          onClick={applyFiltersHTTP}
        >
          Apply
        </Button>
      </div>
    </section>
  );
}

export default DirectoryFilter;
