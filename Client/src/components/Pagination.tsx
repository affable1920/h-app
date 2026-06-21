import { memo } from "react";
import ButtonElement from "./ui/Button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number; // the current page number
  onNext: () => void; // what to do when the user clicks next - api request, state change ...
  onPrevious: () => void;
  hasNext?: boolean;
}

const Pagination = memo(function ({
  currentPage,
  hasNext,
  onNext,
  onPrevious,
}: PaginationProps) {
  const hasPrevious = currentPage > 1;

  return (
    <article className="flex self-end items-center gap-4">
      {hasPrevious && (
        <ButtonElement bg={true} size="md" variant="icon" onClick={onPrevious}>
          <ChevronLeft />
        </ButtonElement>
      )}

      {hasNext && (
        <ButtonElement size="md" variant="icon" bg={true} onClick={onNext}>
          <ChevronRight />
        </ButtonElement>
      )}
    </article>
  );
});

export default Pagination;
