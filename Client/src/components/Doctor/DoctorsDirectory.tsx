import { useEffect } from "react";
import { useOutletContext } from "react-router-dom";

import Card from "../Card";
import useDoctorsQuery from "../../hooks/useDoctorsQuery";

import type { Doctor } from "@/types/Doctor";

import DrCardBack from "./DrCardBack";
import DrCardEssentials from "./DrCardEssentials";
import DrCardSecondaryInfo from "./DrCardSecondaryInfo";

// recieved from the parent outlet
type ParentContext = {
  max: number;
  page: number;
  searchQuery: string;
  setTotalCount: (count: number) => void;
};

function DrCardFront({ doctor }: { doctor: Doctor }) {
  return (
    <>
      <DrCardEssentials doctor={doctor} />
      <DrCardSecondaryInfo doctor={doctor} />
    </>
  );
}

const DoctorsDirectory = () => {
  const { setTotalCount, ...params } = useOutletContext<ParentContext>();

  const { data: { data: doctors = [], total_count } = {}, isError } =
    useDoctorsQuery(params || {});

  useEffect(() => {
    if (total_count) setTotalCount(total_count);
  }, [total_count, setTotalCount]);

  if (isError) return;

  return (doctors || []).map((doctor) => (
    <Card
      key={doctor.id}
      entity={doctor}
      CardFront={<DrCardFront doctor={doctor} />}
      CardBack={<DrCardBack doctor={doctor} />}
    />
  ));
};

export default DoctorsDirectory;
