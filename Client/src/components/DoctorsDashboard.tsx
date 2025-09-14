import { useEffect, useRef } from "react";
import { FcNext, FcPrevious } from "react-icons/fc";
import DoctorCard from "./DoctorCard";
import useDocStore from "../stores/doctorsStore";
import { RiAiGenerate } from "react-icons/ri";
import useModalStore from "../stores/modalStore";
import useQueryStore from "../stores/queryStore";

import { exponentialBackoff } from "../utilities/utils";

const DoctorsDashboard = () => {
  const get = useDocStore((s) => s.get);
  const doctors = useDocStore((s) => s.doctors);

  const max = useQueryStore((s) => s.max);
  const currPage = useQueryStore((s) => s.currPage);
  const searchQuery = useQueryStore((s) => s.searchQuery);

  const setCurrPage = useQueryStore((s) => s.setCurrPage);
  const setSearchQuery = useQueryStore((s) => s.setSearchQuery);

  const ref = useRef<HTMLDivElement>(null);
  const openModal = useModalStore((s) => s.openModal);

  useEffect(() => {
    const fetchDocs = async () => {
      const controller = new AbortController();

      try {
        const query = { max, currPage, searchQuery };
        await exponentialBackoff(() => get(query, controller.signal));
      } catch (ex) {
        console.log(ex);
      }

      return () => controller.abort();
    };

    fetchDocs();
  }, [get, max, searchQuery, currPage]);

  return (
    <section className="flex flex-col gap-4 mx-auto">
      <section className="w-full rounded-md flex items-center justify-between">
        <div
          contentEditable
          onInput={(e) => setSearchQuery(e.currentTarget.textContent)}
          className="input relative outline-none w-full max-w-3/4"
        >
          {!searchQuery && (
            <p className="opacity-60 pointer-events-none absolute">
              Search for a doc ...
            </p>
          )}
          <div className="h-full outline-none border-none min-h-6" />
        </div>
        <RiAiGenerate
          size={24}
          className="cursor-pointer"
          onClick={() => openModal("AIGenerateModal")}
        />
      </section>

      <div ref={ref} className="dashboard">
        {(doctors || []).map((doctor) => (
          <DoctorCard key={doctor.id} doctor={doctor} />
        ))}
      </div>

      <div className="flex items-center self-end">
        <button
          onClick={() => setCurrPage(currPage === 1 ? currPage : currPage + 1)}
        >
          <FcPrevious />
        </button>
        <button onClick={() => setCurrPage(currPage + 1)}>
          <FcNext />
        </button>
      </div>
    </section>
  );
};

export default DoctorsDashboard;
