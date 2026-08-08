import { useOutletContext } from "react-router-dom";
import { useEffect } from "react";
import Card from "@components/Card";
import Spinner from "@/components/ui/Spinner";
import { useGetAll } from "@/hooks/use-doctors";
import DrCardFront from "./DrCardFront";

function DoctorsDirectory() {
  const setHasNext = useOutletContext<(hasNext: boolean) => void>();

  const {
    data: { entities: doctors = [], hasNext = true } = {},
    isFetching,
    isError,
  } = useGetAll();

  useEffect(
    function () {
      setHasNext(hasNext ?? false);
    },
    [hasNext],
  );

  if (isFetching) {
    return <Spinner />;
  }

  if (isError) {
    return null;
  }

  return doctors.map(function (dr) {
    return (
      <Card key={dr.id} entity={dr} CardFront={<DrCardFront doctor={dr} />} />
    );
  });
}

export default DoctorsDirectory;
