import useQueryStore, { type SortOrder } from "@/stores/queryStore";
import Badge from "./Badge";
import { Stack, type StackProps } from "./Stack";

interface SorterProps extends StackProps {
  fields: Array<string>;
}

function Sorter({ fields, ...rest }: SorterProps) {
  const { setSort, sortOrder } = useQueryStore();

  function sort(fieldName: string, order: SortOrder) {
    return setSort.bind(null, fieldName, order);
  }

  return (
    <Stack {...rest}>
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
    </Stack>
  );
}

export default Sorter;
