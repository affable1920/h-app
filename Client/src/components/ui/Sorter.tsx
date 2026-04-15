import useQueryStore, { type SortOrder } from "@/stores/queryStore";
import Button from "./Button";

const fields = [
  { name: "rating", val: "minRating" },
  { name: "distance", val: "maxDistance" },
  { name: "reviews", val: "reviewsCount" },
  { name: "experience" },
  { name: "fee" },
] as const;

function Sorter() {
  const { setSort, sortBy } = useQueryStore();

  function sort(fieldName: string, order: SortOrder) {
    if (sortBy === fieldName) {
      var sortOrder: SortOrder = order === "desc" ? "asc" : "desc";
    }

    setSort(fieldName, sortOrder);
  }

  return (
    <div className="flex flex-col gap-4 p-4 py-6 flex-wrap items-start justify-center">
      {fields.map(({ name }) => {
        return <Button onClick={sort.bind(null, name, "asc")}>{name}</Button>;
      })}
    </div>
  );
}

export default Sorter;
