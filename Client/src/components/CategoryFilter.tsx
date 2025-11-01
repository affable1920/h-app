import Badge from "./eventElements/Badge";
import Ratings from "./Ratings";

type CategoryFilterType = "rating" | "mode";

interface CategoryFilterProps<T extends CategoryFilterType> {
  label: T;
  options: T extends "rating" ? number[] : readonly string[];
  onOptionSelect: (option: string | number) => void;
}

const CategoryFilter = <T extends CategoryFilterType>({
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
            entity={option}
            className="capitalize"
            onClick={() => onOptionSelect(option)}
            content={
              label === "rating" ? (
                <Ratings rating={option as number} />
              ) : (
                (option as string)?.replaceAll("_", " ")
              )
            }
          />
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
