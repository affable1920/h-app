import { useGetAll } from "@/hooks/doctors";
import ButtonElement from "./ui/Button";
import useQueryStore from "@/stores/queryStore";
import { ArrowBigRightDash, ArrowBigLeftDash } from "lucide-react";

const EMPTY = Object.create(null);

function Pagination() {
  const { page = 1, setPage } = useQueryStore();
  const isFirstPage = page === 1;

  const { data: { has_next } = { has_next: false } } = useGetAll();

  function handlePageChange(dir: "next" | "prev") {
    let nextPage: number;

    const isInvalidPage =
      (isFirstPage && dir === "prev") || (!has_next && dir === "next");

    if (isInvalidPage) {
      return;
    }

    if (dir === "next") {
      nextPage = page + 1;
    } else {
      nextPage = page - 1;
    }
    setPage(nextPage);
  }

  return (
    <article className="flex self-end items-center gap-4">
      {!isFirstPage && (
        <ButtonElement
          size="md"
          variant="ghost"
          onClick={handlePageChange.bind(EMPTY, "prev")}
        >
          <ArrowBigLeftDash />
        </ButtonElement>
      )}

      {has_next && (
        <ButtonElement
          size="md"
          variant="ghost"
          onClick={handlePageChange.bind(EMPTY, "next")}
        >
          <ArrowBigRightDash />
        </ButtonElement>
      )}
    </article>
  );
}

export default Pagination;
