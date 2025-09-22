import { useEffect, useRef } from "react";
import DoctorCard from "./DoctorCard";
import useDocStore from "../stores/doctorsStore";
import { RiAiGenerate } from "react-icons/ri";
import useModalStore from "../stores/modalStore";
import useQueryStore from "../stores/queryStore";
import { FcNext, FcPrevious } from "react-icons/fc";
import { debounce, exponentialBackoff } from "../utilities/utils";

const DoctorsDashboard = () => {
  const getDoctors = useDocStore((s) => s.getDoctors);
  const doctors = useDocStore((s) => s.doctors);

  const limit = useQueryStore((s) => s.limit);
  const currPage = useQueryStore((s) => s.currPage);

  const totalCount = useQueryStore((s) => s.totalCount);
  const searchQuery = useQueryStore((s) => s.searchQuery);

  const setCurrPage = useQueryStore((s) => s.setCurrPage);
  const setSearchQuery = useQueryStore((s) => s.setSearchQuery);

  const ref = useRef<HTMLDivElement>(null);
  const openModal = useModalStore((s) => s.openModal);

  const dbSetSearchQuery = debounce(setSearchQuery, 100);

  useEffect(() => {
    const fetchDocs = async () => {
      const controller = new AbortController();

      try {
        // await get(query, controller.signal);
        await exponentialBackoff(() =>
          getDoctors({ limit, currPage, searchQuery }, controller.signal)
        );
      } catch (ex) {
        console.log(ex);
      }

      return () => controller.abort();
    };
    fetchDocs();
  }, [getDoctors, limit, currPage, searchQuery]);

  const isLastPage =
    doctors.length < limit || currPage === Math.ceil((totalCount || 0) / limit);

  useEffect(() => {
    // console.log(chat());
  }, []);

  return (
    <section className="flex flex-col gap-4 mx-auto">
      <section className="w-full rounded-md flex items-center justify-between">
        <input
          // value={searchQuery}
          placeholder="Search for a doc ..."
          onChange={(e) => dbSetSearchQuery(e.target.value)}
          className="input relative outline-none w-full max-w-3/4"
        />
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
        <button onClick={() => setCurrPage(currPage === 1 ? 1 : currPage - 1)}>
          <FcPrevious />
        </button>
        <button
          className={`${isLastPage ? "hidden" : "flex"}`}
          onClick={() => setCurrPage(currPage + 1)}
        >
          <FcNext />
        </button>
      </div>
    </section>
  );
};

export default DoctorsDashboard;
