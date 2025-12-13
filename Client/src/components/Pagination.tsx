import { useCallback } from "react";

import useQueryStore from "@/stores/queryStore";
import { useAllDoctors } from "@/hooks/useDoctorsQuery";

import ButtonElement from "./common/Button";
import { ArrowBigRightDash, ArrowBigLeftDash } from "lucide-react";

const Pagination = () => {
  const { page, setPage } = useQueryStore();
  const { data: { has_more = false } = {} } = useAllDoctors();

  const isFirstPage = page === 1;

  const handlePageChange = useCallback((direction: "next" | "prev") => {
    if (
      (isFirstPage && direction === "prev") ||
      (!has_more && direction === "next")
    )
      return;

    const nextPage = direction === "next" ? page + 1 : page - 1;
    setPage(nextPage);
  }, []);

  return (
    <article className="flex self-end items-center gap-4">
      {!isFirstPage && (
        <ButtonElement variant="icon" onClick={() => handlePageChange("prev")}>
          <ArrowBigLeftDash />
        </ButtonElement>
      )}

      {has_more && (
        <ButtonElement variant="icon" onClick={() => handlePageChange("next")}>
          <ArrowBigRightDash />
        </ButtonElement>
      )}
    </article>
  );
};

export default Pagination;
