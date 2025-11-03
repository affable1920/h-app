import { useCallback, useState } from "react";
import Input from "../eventElements/Input";
import * as constants from "../../utils/constants";
import Button from "../eventElements/Button";
import useModalStore from "@/stores/modalStore";
import Badge from "../eventElements/Badge";
import CategoryFilter from "./CategoryFilter";
import SelectFilter from "./SelectFilter";

type FilterCategories = "specialization" | "distance" | "rating" | "mode";

type Filters = {
  [K in FilterCategories]?: string | number | null;
};

const categoryFilters: {
  label: "rating" | "mode";
  options: readonly (string | number)[];
}[] = [
  { label: "mode", options: constants.CONSULTATION_MODES },
  { label: "rating", options: [1, 2, 3, 4] as const },
];

const DirectoryFilter = () => {
  const [filters, setFilters] = useState<Filters>({});

  function handleFilterUpdate<T extends keyof Filters>(
    key: T,
    value: Filters[T]
  ): void {
    setFilters((p) => ({ ...p, [key]: value }));
  }

  const selectedSpecialization = filters?.["specialization"];

  const handleSpecUpdate = useCallback(function (spec: string | null) {
    handleFilterUpdate("specialization", spec);
  }, []);

  const handleCategoryUpdate = useCallback(function (
    label: "rating" | "mode",
    option: string | number
  ) {
    handleFilterUpdate(label, option);
  },
  []);

  return (
    <section className="flex flex-col items-end h-full gap-8 p-2">
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
          />
        ))}
      </section>

      <div className="flex items-center gap-4">
        <Button
          size="md"
          variant="outlined"
          onClick={useModalStore.getState().closeModal}
        >
          Cancel
        </Button>
        <Button size="md" variant="outlined">
          Apply
        </Button>
      </div>
    </section>
  );
};

export default DirectoryFilter;
