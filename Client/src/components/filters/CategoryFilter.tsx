import Ratings from "../Ratings";
import Badge from "../common/Badge";
import type { ButtonProps } from "@/types/button";

interface CategoryFilterProps {
  label: string;
  size?: ButtonProps["size"];
  options: number[] | string[];
  selectedOption?: number | string;
  onOptionSelect: (option: number | string) => void;
}

const CategoryFilter = ({
  label,
  options,
  selectedOption,
  onOptionSelect,
}: CategoryFilterProps) => {
  return (
    <div className="filter-div">
      <label>{label}</label>
      <div className="flex gap-2 items-center ml-auto">
        {options.map((option) => (
          <Badge
            size="md"
            key={option}
            selected={option == selectedOption}
            onClick={() => onOptionSelect(option)}
          >
            {label.toLowerCase().includes("rating") ? (
              <Ratings rating={option as number} />
            ) : (
              option
            )}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
