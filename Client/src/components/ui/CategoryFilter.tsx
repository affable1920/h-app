import Ratings from "../Ratings";
import type { ButtonProps } from "@/types/button";
import { Stack } from "./Stack";

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
    <Stack orientation="V">
      <label className="text-text-normal">{label}</label>

      <Stack gap="md">
        {options.map((option) => (
          <span key={option} onClick={onOptionSelect.bind(null, option)}>
            {label.toLowerCase().includes("rating") ? (
              <Ratings rating={option as number} />
            ) : (
              option
            )}
          </span>
        ))}
      </Stack>
    </Stack>
  );
};

export default CategoryFilter;
