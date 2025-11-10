import { useCallback, useState } from "react";
import { useSearchParams } from "react-router-dom";

import Input from "../eventElements/Input";
import * as constants from "../../utils/constants";
import Button from "../eventElements/Button";
import useModalStore from "@/stores/modalStore";
import Badge from "../eventElements/Badge";
import CategoryFilter from "./CategoryFilter";
import SelectFilter from "./SelectFilter";
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
    options: [1, 2, 3, 4],
  },
];

const DirectoryFilter = () => {
  const [filters, setFilters] = useState<Partial<Filters>>({});
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  function handleFilterUpdate<T extends keyof Filters>(
    key: T,
    value: Filters[T]
  ): void {
    setFilters((p) => ({ ...p, [key]: value }));
  }

  const handleSpecUpdate = useCallback(function (spec: string | null) {
    handleFilterUpdate("specialization", spec);
  }, []);

  const handleCategoryUpdate = useCallback(
    function (
      label: keyof CategoryFilters,
      option: Filters[keyof CategoryFilters]
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
  const [, setSearchParams] = useSearchParams();

  async function applyFiltersHTTP() {
    // Required before applying filters -
    // curr directory
    // filters applied
    // access to directory hook

    const newParams = new URLSearchParams();

    for (const [key, val] of Object.entries(filters)) {
      console.info("adding filters: ", key, val);
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
    <section className="flex flex-col items-end h-full gap-8 p-2 relative">
      {activeFilterCount > 0 && (
        <div className="flex gap-4 items-center">
          <Button
            variant="icon"
            className="underline underline-offset-2 text-blue-700"
            onClick={() => setFilters({})}
          >
            Clear all
          </Button>
          <Badge
            size="sm"
            className="bg-accent text-white shadow-none border-accent-dark"
            children={activeFilterCount}
          />
        </div>
      )}
      <section className="flex flex-col gap-8 w-full grow">
        <div className="flex flex-col gap-4">
          {selectedSpecialization && (
            <Badge
              size="md"
              className="w-fit capitalize"
              isOn={() => !!selectedSpecialization}
              onClick={() => handleSpecUpdate(null)}
            >
              {selectedSpecialization}
            </Badge>
          )}
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

        <div>
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
            selectedOption={filters?.[category.label]}
          />
        ))}
      </section>

      <div className="flex items-center gap-4">
        <Button
          variant="contained"
          onClick={useModalStore.getState().closeModal}
        >
          Cancel
        </Button>
        <Button
          onClick={applyFiltersHTTP}
          disabled={!activeFilterCount}
          variant="contained"
        >
          Apply
        </Button>
      </div>
    </section>
  );
};

export default DirectoryFilter;
