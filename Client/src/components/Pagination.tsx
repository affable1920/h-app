import { useGetAll } from "@/hooks/doctors";

import ButtonElement from "./common/Button";
import useQueryStore from "@/stores/queryStore";
import {
  ArrowBigRightDash,
  ArrowBigLeftDash,
  RotateCcwSquare,
} from "lucide-react";
import Button from "./common/Button";

const Pagination = () => {
  const { data } = useGetAll();
  const { page = 1, setPage, reset } = useQueryStore();

  const handlePageChange = (direction: "next" | "prev") => {
    if (
      (!data?.has_prev && direction === "prev") ||
      (!data?.has_next && direction === "next")
    )
      return;

    const nextPage = direction === "next" ? page + 1 : page - 1;
    setPage(nextPage);
  };

  if (data?.paginated_count === 0)
    return (
      <article
        data-tooltip="Reset all filters !"
        className="flex justify-center items-center"
      >
        <Button onClick={reset} variant="ghost" size="md">
          <RotateCcwSquare />
        </Button>
      </article>
    );

  return (
    <article className="flex self-end items-center gap-4">
      {data?.has_prev && (
        <ButtonElement
          size="md"
          variant="ghost"
          onClick={() => handlePageChange("prev")}
        >
          <ArrowBigLeftDash />
        </ButtonElement>
      )}

      {data?.has_next && (
        <ButtonElement
          size="md"
          variant="ghost"
          onClick={() => handlePageChange("next")}
        >
          <ArrowBigRightDash />
        </ButtonElement>
      )}
    </article>
  );
};

export default Pagination;
