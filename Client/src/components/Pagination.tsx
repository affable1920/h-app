import ButtonElement from "./eventElements/Button";
import { ArrowBigRightDash, ArrowBigLeftDash } from "lucide-react";

interface PaginationProps {
  max?: number;
  page?: number;
  isLastPage: boolean;
  isFirstPage: boolean;
  onPageChange: (direction: "next" | "prev") => void;
}

const Pagination = ({
  isFirstPage,
  isLastPage,
  onPageChange,
}: PaginationProps) => {
  return (
    <article className="flex self-end items-center gap-4">
      {!isFirstPage && (
        <ButtonElement variant="icon" onClick={onPageChange.bind(null, "prev")}>
          <ArrowBigLeftDash />
        </ButtonElement>
      )}

      {!isLastPage && (
        <ButtonElement variant="icon" onClick={onPageChange.bind(null, "next")}>
          <ArrowBigRightDash />
        </ButtonElement>
      )}
    </article>
  );
};

export default Pagination;
