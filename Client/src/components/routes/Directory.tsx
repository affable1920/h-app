import { useState, useMemo, Suspense } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import Spinner from "../Spinner";
import Badge from "../common/Badge";
import Input from "@/components/common/Input";

import Pagination from "@components/Pagination";
import Button from "@/components/common/Button";

import { debounce } from "@/utils/appUtils";
import { IoRefreshOutline } from "react-icons/io5";
import { ArrowLeftRight, X, SlidersHorizontal } from "lucide-react";

import useQueryStore from "@stores/queryStore";
import useModalStore from "@/stores/modalStore";
import { useAllDoctors } from "@/hooks/useDoctorsQuery";

const Directory = () => {
  const navigate = useNavigate();
  const [localSQ, setLocalSQ] = useState("");

  const { data: { applied_filters = [] } = {} } = useAllDoctors();
  const { searchQuery, setSearchQuery, clearSearchQuery } = useQueryStore();

  const setQueryCached = useMemo(function () {
    return debounce(setSearchQuery, 200);
  }, []);

  const location = useLocation().pathname.split("/").at(1) ?? "doctors";

  function handleDirectorySwitch() {
    const nextDir = location === "doctors" ? "clinics" : "doctors";
    navigate(`/${nextDir}`);
  }

  function handleFilterState() {
    useModalStore.getState().openModal("directoryFilter", {
      viewOverlay: true,
      position: "bottom",
    });
  }

  function handleSearch(query: string) {
    setLocalSQ(query);
    setQueryCached(query);
  }

  return (
    <section className="flex flex-col gap-4 mx-auto">
      <section className="w-full rounded-md flex items-center justify-between gap-4">
        {/* search bar */}

        <div className="flex items-center gap-4 order-1">
          <Input
            value={localSQ}
            placeholder="Search"
            className="italic placeholder:text-sm"
            onChange={(ev) => handleSearch(ev.target.value)}
          >
            <Button variant={"icon"}>
              {searchQuery ? <X onClick={clearSearchQuery} /> : "Ctrl K"}
            </Button>
          </Input>

          <Button size="md" variant="icon" onClick={handleDirectorySwitch}>
            <ArrowLeftRight />
          </Button>
        </div>

        {/* rest of the filters  */}
        <div className="flex gap-4 items-center">
          <Button
            size="md"
            variant="icon"
            onClick={handleFilterState}
            className="[&:has(.info)]:relative max-w-fit flex items-center"
          >
            <SlidersHorizontal />
            {!!applied_filters.length && (
              <Badge content={applied_filters.length.toString()} />
            )}
          </Button>

          {!!applied_filters.length && (
            <Button variant="icon">
              <IoRefreshOutline />
            </Button>
          )}
        </div>
      </section>

      {applied_filters && (
        <section className="flex items-center gap-4 flex-wrap">
          {applied_filters.map(([, appliedFilterVal]) => (
            <Badge content={appliedFilterVal} />
          ))}
        </section>
      )}

      <section className="directory-layout">
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
