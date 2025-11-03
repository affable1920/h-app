import Ratings from "../Ratings";
import Badge from "../eventElements/Badge";
import type { ButtonProps } from "@/types/appButtonTypes";

type CategoryFilterType = "rating" | "mode";

interface CategoryFilterProps<T extends CategoryFilterType> {
  label: T;
  size?: ButtonProps["size"];
  options: readonly (string | number)[];
  onOptionSelect: (label: CategoryFilterType, option: string | number) => void;
}

const CategoryFilter = <T extends CategoryFilterType>({
  size = "md",
  label,
  options,
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
            onClick={() => onOptionSelect(label, option)}
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
