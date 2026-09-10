import { useOutletContext, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import CardFlippable from "@/components/lib/CardFlippable";
import Spinner from "@/components/ui/Spinner";
import DrCardFront from "./DrCardFront";
import { useDoctors } from "@/hooks/use-doctors";
import { keepPreviousData } from "@tanstack/react-query";

function DoctorsDirectory() {
  const [params] = useSearchParams();
  const setHasNext = useOutletContext<(hasNext: boolean) => void>();

  const {
    data: { entities: doctors = [], hasNext = true } = {},
    isFetching,
    isError,
  } = useDoctors(Object.fromEntries(params.entries()), {
    refetchOnMount: false,
    placeholderData: keepPreviousData,
  });

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
      <CardFlippable
        key={dr.id}
        entity={dr}
        CardFront={<DrCardFront doctor={dr} />}
      />
    );
  });
}

export default DoctorsDirectory;
