import { memo } from "react";
import Button from "./ui/Button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number; // the current page number
  hasNext?: boolean;
  onPageChange: (dir: "next" | "previous") => void;
}

const Pagination = memo(function ({
  currentPage,
  hasNext,
  onPageChange,
}: PaginationProps) {
  return (
    <article className="flex self-end items-center gap-4">
      {currentPage > 1 && (
        <Button
          bg={true}
          size="md"
          variant="icon"
          onClick={function () {
            onPageChange("previous");
          }}
        >
          <ChevronLeft />
        </Button>
      )}

      {hasNext && (
        <Button
          size="md"
          variant="icon"
          bg={true}
          onClick={function () {
            onPageChange("next");
          }}
        >
          <ChevronRight />
        </Button>
      )}
    </article>
  );
});

export default Pagination;
