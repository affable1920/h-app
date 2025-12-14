import Ratings from "../Ratings";
import Badge from "../common/Badge";
import type { ButtonProps } from "@/types/button";
import { type CategoryFilters } from "./types";

type CategoryFilterKey = keyof CategoryFilters;

interface CategoryFilterProps<T extends CategoryFilterKey> {
  label: T;
  size?: ButtonProps["size"];
  options: number[] | string[];
  optionIsSelected?: T extends "minRating" ? number : string;
  onOptionSelect: (label: T, option: CategoryFilters[T]) => void;
}

const CategoryFilter = <T extends CategoryFilterKey>({
  size = "md",
  label,
  options,
  optionIsSelected,
  onOptionSelect,
}: CategoryFilterProps<T>) => {
  return (
    <div className="filter-div">
      <label className="label">Filter by {label}</label>
      <div className="flex gap-2 flex-wrap">
        {options.map((option) => (
          <Badge
            key={option}
            size={"sm"}
            on={() => option == optionIsSelected}
            onClick={() => onOptionSelect(label, option as CategoryFilters[T])}
          >
            {label === "minRating" ? (
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
