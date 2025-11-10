import { useSearchParams } from "react-router-dom";
import { useAllDoctors } from "@/hooks/useDoctorsQuery";

import ButtonElement from "./eventElements/Button";
import { ArrowBigRightDash, ArrowBigLeftDash } from "lucide-react";

const Pagination = () => {
  const { handlePageChange, data: { has_more = false } = {} } = useAllDoctors();
  const isFirstPage = parseInt(useSearchParams()?.[0].get("page") ?? "1") === 1;

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
