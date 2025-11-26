import { useSearchParams } from "react-router-dom";
import { useAllDoctors } from "@/hooks/useDoctorsQuery";

import ButtonElement from "./common/Button";
import { ArrowBigRightDash, ArrowBigLeftDash } from "lucide-react";
import { useCallback } from "react";

const Pagination = () => {
  const { data: { has_more = false } = {} } = useAllDoctors();
  const [searchParams, setSearchParams] = useSearchParams();

  const isFirstPage = parseInt(useSearchParams()?.[0].get("page") ?? "1") === 1;

  const handlePageChange = useCallback(
    function (direction: "next" | "prev") {
      const page = parseInt(searchParams.get?.("page") ?? "1");
      const nextPage = direction === "next" ? page + 1 : page - 1;

      setSearchParams((p) => ({ ...p, page: nextPage.toString() }));
    },
    [searchParams, setSearchParams]
  );

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
