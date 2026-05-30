import useQueryStore, { type SortOrder } from "@/stores/queryStore";
import Badge from "./Badge";

function Sorter({ fields }: { fields: Array<string> }) {
  const { setSort, sortOrder } = useQueryStore();

  function sort(fieldName: string, order: SortOrder) {
    return setSort.bind(null, fieldName, order);
  }

  return (
    <div className="flex flex-col gap-4 p-4 py-6 flex-wrap items-start justify-center">
      {fields.map((field) => {
        return (
          <Badge
            full={false}
            onClick={sort(field, sortOrder === "asc" ? "desc" : "asc")}
          >
            {field}
          </Badge>
        );
      })}
    </div>
  );
}

export default Sorter;
