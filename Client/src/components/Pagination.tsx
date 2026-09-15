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
          variant="icon"
          data-tooltip="back"
          aria-label="go-back"
          onClick={function () {
            onPageChange("previous");
          }}
        >
          <ChevronLeft strokeWidth={4} />
        </Button>
      )}

      {hasNext && (
        <Button
          variant="icon"
          bg={true}
          data-tooltip="next"
          aria-label="go-forward"
          onClick={function () {
            onPageChange("next");
          }}
        >
          <ChevronRight strokeWidth={4} />
        </Button>
      )}
    </article>
  );
});

export default Pagination;
