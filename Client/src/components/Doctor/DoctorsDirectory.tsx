import { useEffect } from "react";
import { useOutletContext } from "react-router-dom";

import Spinner from "../Spinner";
import DoctorCard from "./DoctorCard";
import useDoctorsQuery from "../../hooks/useDoctorsQuery";

type ParentContext = {
  max: number;
  page: number;
  searchQuery: string;
  setTotalCount: (count: number) => void;
};

const DoctorsDirectory = () => {
  const { setTotalCount, ...params } = useOutletContext<ParentContext>();

  const {
    data: { data: doctors = [], total_count } = {},
    isPending,
    isError,
  } = useDoctorsQuery(params || {});

  useEffect(() => {
    if (total_count) setTotalCount(total_count);
  }, [total_count, setTotalCount]);

  if (isPending) return <Spinner loading={isPending} />;

  if (isError) return;

  return (doctors || []).map((doctor) => (
    <DoctorCard key={doctor.id} doctor={doctor} />
  ));
};

export default DoctorsDirectory;
