import React, { useEffect, useRef, useState } from "react";
import DoctorCard from "./DoctorCard";
import useDocStore from "../../stores/doctorsStore";
import { RiAiGenerate } from "react-icons/ri";
import useModalStore from "../../stores/modalStore";
import useQueryStore from "../../stores/queryStore";
import { FcNext, FcPrevious } from "react-icons/fc";
import { debounce, exponentialBackoff } from "../../utilities/utils";
import Button from "../Button";

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

  // Debounced version of setSearchQuery to limit API calls
  // dbSetSearchQuery is a new function on every render
  // call one - dbSetSearchQuery = fn1 => e.g let fn1 = () => console.log("hello")
  // call two - dbSetSearchQuery = fn2 => e.g let fn2 = () => console.log("hello")
  // as fn1 !== fn2, dbSetSearchQuery is a new function every time
  const dbSetSearchQuery = debounce(setSearchQuery, 180);

  useEffect(() => {
    console.log("dash effect called.");
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

  const [searchText, setSearchText] = useState("");

  const isLastPage =
    doctors.length < limit || currPage === Math.ceil((totalCount || 0) / limit);

  function handleSearch({
    target: { value: input = "" },
  }: React.ChangeEvent<HTMLInputElement>) {
    setSearchText(input);
    dbSetSearchQuery(input);
  }

  return (
    <section className="flex flex-col gap-4 mx-auto">
      <section className="w-full rounded-md flex items-center justify-between md:justify-end gap-4">
        <div className="input w-full max-w-3xs flex items-center relative italic">
          <input
            value={searchText}
            placeholder="Search for a doc ..."
            onChange={handleSearch}
            className="placeholder:opacity-60 outline-none w-full"
          />
          <Button className="absolute text-xs right-1">Ctrl K</Button>
        </div>
        <RiAiGenerate
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
