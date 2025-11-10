import { useState, useMemo } from "react";
import {
  Outlet,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import Pagination from "@components/Pagination";
import Input from "@components/eventElements/Input";
import Button from "@components/eventElements/Button";

import { debounce } from "@/utils/appUtils";

import useModalStore from "@/stores/modalStore";
import { ArrowLeftRight, X, SlidersHorizontal } from "lucide-react";

const Directory = () => {
  const navigate = useNavigate();

  const [localSQ, setLocalSQ] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  const cachedSQSetter = useMemo(
    function () {
      return debounce(function (sq: string) {
        setSearchParams((p) => ({ ...p, searchQuery: sq, page: 1 }));
      }, 200);
    },
    [setSearchParams]
  );

  const searchQuery = searchParams.get("searchQuery") ?? "";
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

  function handleSearch(sq: string) {
    setLocalSQ(sq);
    cachedSQSetter(sq);
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
              {searchQuery ? <X onClick={() => handleSearch("")} /> : "Ctrl K"}
            </Button>
          </Input>

          <Button variant="icon" onClick={handleDirectorySwitch}>
            <ArrowLeftRight />
          </Button>
        </div>

        {/* rest of the filters  */}
        <div className="flex items-center gap-4">
          <Button variant="icon" onClick={handleFilterState}>
            <SlidersHorizontal />
          </Button>
        </div>
      </section>

      <section className="directory-layout">
        {/* outlet renders either the Doctor or clinic directory passing them the setTotalCount func */}
        <Outlet />
      </section>

      <Pagination />
    </section>
  );
};

export default Directory;
