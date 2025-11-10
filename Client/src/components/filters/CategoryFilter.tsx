import Ratings from "../Ratings";
import Badge from "../eventElements/Badge";
import type { ButtonProps } from "@/types/appButtonTypes";
import { type CategoryFilters } from "./types";

type FilterKey = keyof CategoryFilters;
type CurrentCategoryType<T extends FilterKey> = CategoryFilters[T];

interface CategoryFilterProps<T extends FilterKey> {
  label: T;
  size?: ButtonProps["size"];
  options: T extends "rating" ? number[] : string[];
  selectedOption?: CurrentCategoryType<T>;
  onOptionSelect: (label: T, option: CurrentCategoryType<T>) => void;
}

const CategoryFilter = <T extends FilterKey>({
  size = "md",
  label,
  options,
  selectedOption,
  onOptionSelect,
}: CategoryFilterProps<T>) => {
  return (
    <div>
      <header className="card-h2 italic">Filter by {label}</header>
      <div className="flex gap-2 flex-wrap mt-2">
        {options.map((option) => (
          <Badge
            key={option}
            size={size}
            isOn={() => option === selectedOption}
            onClick={() =>
              onOptionSelect(label, option as CurrentCategoryType<T>)
            }
          >
            {label === "rating" ? (
              <Ratings rating={option as number} />
            ) : (
              (option as string)?.replaceAll("_", " ")
            )}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
