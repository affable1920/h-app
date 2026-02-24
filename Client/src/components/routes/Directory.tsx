import { useState, Suspense, useCallback } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import Spinner from "../Spinner";
import Input from "@/components/common/Input";

import Pagination from "@components/Pagination";
import Button from "@/components/common/Button";

import { debounce } from "@/utils/appUtils";

import useModalStore from "@/stores/modalStore";
import useQueryStore from "@/stores/queryStore";

import { ArrowDown01, ArrowDown10 } from "lucide-react";
import { ArrowLeftRight, X, SlidersHorizontal } from "lucide-react";

const Directory = () => {
  const navigate = useNavigate();
  const [localSQ, setLocalSQ] = useState("");

  /*
  Using functions from the filter store anywhere will resolve in an error when not used as instances 
  of the store object (destructured.) because they lose their "this" binding.

  Use arrow methods inside the class.
  use as instanc methods on the object itself -> store.functionName
  */
  const {
    searchQuery,
    setSearchQuery,
    clearSearchQuery,
    sortOrder = "desc",
    sortBy,
    setSort,
  } = useQueryStore();

  // const setQueryCached = useCallback(debounce((sq) => setSearchQuery(sq)), []);
  const setQueryCached = useCallback(debounce(setSearchQuery), []);

  const location = useLocation().pathname.split("/").at(1) ?? "doctors";

  function handleDirectorySwitch() {
    const nextDir = location === "doctors" ? "clinics" : "doctors";
    navigate(`/${nextDir}`);
  }

  function openDirectoryFilter() {
    useModalStore.getState().openModal("directoryFilter", {
      viewOverlay: true,
      position: "bottom",
    });
  }

  function handleSearch(query: string) {
    setLocalSQ(query);
    setQueryCached(query);
  }

  function removeSearchQuery() {
    setLocalSQ("");
    clearSearchQuery();
  }

  return (
    <section className="flex flex-col gap-4 mx-auto">
      <section className="w-full rounded-md flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={openDirectoryFilter}>
            <SlidersHorizontal />
          </Button>

          <Button
            variant="ghost"
            onClick={() =>
              setSort(sortBy ?? "rating", sortOrder === "asc" ? "desc" : "asc")
            }
            data-tooltip={sortOrder}
          >
            {sortOrder === "asc" ? (
              <ArrowDown01 />
            ) : (
              sortOrder === "desc" && <ArrowDown10 />
            )}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {/* search bar */}
          <Input
            id="searchQuery"
            value={localSQ}
            placeholder="Search"
            className="italic placeholder:text-sm py-2"
            onChange={(ev) => handleSearch(ev.target.value)}
          />
          {searchQuery && (
            <Button variant="ghost" size="sm">
              <X onClick={removeSearchQuery} />
            </Button>
          )}

          <Button variant="ghost" onClick={handleDirectorySwitch}>
            <ArrowLeftRight />
          </Button>
        </div>
      </section>
      <section className="grid gap-6 grid-cols-[repeat(auto-fill,minmax(400px,1fr))]">
        {/* outlet renders either the Doctor or clinic directory */}
        <Suspense fallback={<Spinner />}>
          <Outlet />
        </Suspense>
      </section>

      <Pagination />
    </section>
  );
};

export default Directory;
