import React, { useState } from "react";
import {
  Outlet,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import Button from "../eventElements/Button";
import Pagination from "../Pagination";
import { ArrowLeftRight, X, Funnel } from "lucide-react";
import useModalStore from "@/stores/modalStore";

const Directory = () => {
  const location = useLocation().pathname?.split("/").at(1) ?? "doctors";

  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const max = parseInt(params.get("params") ?? "9");
  const page = parseInt(params.get("page") ?? "1");
  const searchQuery = params.get("searchQuery") ?? "";

  const [entityCount, setEntityCount] = useState<number>(0);
  const isLastPage = entityCount < max || page === Math.ceil(entityCount / max);

  function setTotalCount(count: number) {
    setEntityCount(count);
  }

  function handleSearch(ev: React.ChangeEvent<HTMLInputElement>) {
    setParams((prev) => ({ ...prev, page: 1, searchQuery: ev.target.value }));
  }

  function handleDirectorySwitch() {
    const nextDir = location === "doctors" ? "clinics" : "doctors";
    navigate(`/${nextDir}`);
  }

  function handlePageChange(direction: "next" | "prev") {
    if (
      (page === 1 && direction === "prev") ||
      (isLastPage && direction === "next")
    )
      return;

    const pageToSet = direction === "next" ? page + 1 : page - 1;
    setParams((p) => ({ ...p, page: pageToSet }));
  }

  function handleFilter() {
    useModalStore.getState().openModal("directoryFilter", {
      viewOverlay: true,
      position: "bottom",
    });
  }

  return (
    <section className="flex flex-col gap-4 mx-auto">
      <section className="w-full rounded-md flex items-center justify-between gap-4">
        {/* search bar */}

        <div className="flex items-center gap-4 order-1">
          <div className="input w-full max-w-3xs flex items-center relative italic">
            <input
              value={searchQuery}
              placeholder="Search"
              onChange={handleSearch}
              className="placeholder:opacity-60 outline-none w-full"
            />
            <Button
              variant="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onClick={() => setParams((p) => ({ ...p, searchQuery: "" }))}
            >
              {params.get("searchQuery") ? <X /> : "Ctrl K"}
            </Button>
          </div>

          <Button variant="icon" onClick={handleDirectorySwitch}>
            <ArrowLeftRight />
          </Button>
        </div>

        {/* rest of the filters  */}
        <div className="flex items-center gap-4">
          <Button variant="icon" onClick={handleFilter}>
            <Funnel />
          </Button>
        </div>
      </section>

      <section className="directory-layout">
        <Outlet context={{ max, page, searchQuery, setTotalCount }} />
      </section>

      <Pagination
        isLastPage={isLastPage}
        isFirstPage={page === 1}
        onPageChange={handlePageChange}
      />
    </section>
  );
};

export default Directory;
