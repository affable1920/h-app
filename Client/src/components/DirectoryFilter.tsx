import { useState } from "react";
import Input from "./eventElements/Input";
import * as constants from "../utils/constants";
import Button from "./eventElements/Button";
import Dropdown from "./eventElements/Dropdown";
import useModalStore from "@/stores/modalStore";
import Badge from "./eventElements/Badge";
import { ChevronUpIcon } from "lucide-react";
import Ratings from "./Ratings";

export interface FilterCategory {
  label: string;
  type: "text" | "range" | "checkbox";
}

const filterCategories: FilterCategory[] = [
  { label: "distance", type: "range" },
];

const allSpecs: readonly string[] = constants.SPECIALIZATIONS.map((s) =>
  s.toLowerCase()
);

interface Filters {
  specialization?: string | null;
  distance?: number | null;
  rating?: number | null;
}

const DirectoryFilter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({});

  function handleFilterUpdate<T extends keyof Filters>(
    key: T,
    value: Filters[T]
  ): void {
    setFilters((p) => ({ ...p, [key]: value }));
  }

  const selectedSpec = filters?.["specialization"];

  return (
    <section className="flex flex-col items-end h-full gap-8 p-2">
      <section className="flex flex-col gap-8 w-full justify-between grow">
        {/*  */}
        {/* spec filter */}

        <div className="flex flex-col gap-4">
          {selectedSpec && (
            <Badge
              entity={selectedSpec}
              content={selectedSpec}
              isOn={() => !!selectedSpec}
              className="w-fit capitalize"
              onClick={() => handleFilterUpdate("specialization", null)}
            />
          )}
          <Dropdown
            show={isOpen}
            options={allSpecs}
            onOptionSelect={(selectedOption) =>
              handleFilterUpdate("specialization", selectedOption)
            }
          />
          <Button
            size="md"
            variant="outlined"
            onClick={() => setIsOpen((p) => !p)}
            className="font-semibold gap-2 active:scale-100"
          >
            {"Select Specialization"}
            <ChevronUpIcon
              size={13}
              className={`transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              } `}
            />
          </Button>
        </div>

        {/* distance filter */}
        {filterCategories.map((category) => (
          <Input
            min={1}
            max={40}
            step={2.2}
            key={category.label}
            type={category.type}
            label={category.label}
            onChange={(ev) =>
              handleFilterUpdate(
                category.label as keyof Filters,
                parseInt(ev.target.value)
              )
            }
          />
        ))}

        {/* rating filter */}
        <div>
          <label htmlFor="ratings" className="label text-base">
            Filter by rating
          </label>
          <div className="flex flex-wrap gap-2 mt-2">
            {[1, 2, 3, 4].map((rating) => (
              <Button
                key={rating}
                size="md"
                variant="outlined"
                onClick={() => handleFilterUpdate("rating", rating)}
                className="hover:ring-2 active:ring-secondary-dark grow"
              >
                <Ratings rating={rating} />
              </Button>
            ))}
          </div>

          {/*  */}
        </div>
      </section>

      <div className="flex items-center gap-4">
        <Button
          size="md"
          color="primary"
          variant="contained"
          onClick={() => useModalStore.getState().closeModal()}
        >
          Cancel
        </Button>
        <Button size="md" variant="contained" color="primary">
          Apply
        </Button>
      </div>
    </section>
  );
};

export default DirectoryFilter;
