import { useCallback } from "react";
import { useAllDoctors } from "@/hooks/useDoctorsQuery";

import ButtonElement from "./common/Button";
import { ArrowBigRightDash, ArrowBigLeftDash } from "lucide-react";
import { useSearchParams } from "react-router-dom";

const Pagination = () => {
  const [params, setSearchParams] = useSearchParams();
  const { data: { has_next = false, has_prev = false } = {} } = useAllDoctors();

  const page = Number(params.get("page")) ?? 1;

  const handlePageChange = useCallback((direction: "next" | "prev") => {
    if (
      (!has_prev && direction === "prev") ||
      (!has_next && direction === "next")
    )
      return;

    const nextPage = direction === "next" ? page + 1 : page - 1;
    setSearchParams((p) => {
      p.set("page", nextPage.toString());
      return p;
    });
  }, []);

  return (
    <article className="flex self-end items-center gap-4">
      {!has_prev && (
        <ButtonElement variant="icon" onClick={() => handlePageChange("prev")}>
          <ArrowBigLeftDash />
        </ButtonElement>
      )}

      {has_next && (
        <ButtonElement variant="icon" onClick={() => handlePageChange("next")}>
          <ArrowBigRightDash />
        </ButtonElement>
      )}
    </article>
  );
};

export default Pagination;
