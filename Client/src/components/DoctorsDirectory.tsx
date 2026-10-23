import { useOutletContext, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import CardFlippable from "@/components/lib/CardFlippable";
import Spinner from "@/components/ui/Spinner";
import DrCardFront from "./DrCardFront";
import { useGetDoctors } from "@/hooks/use-doctors";

export function DoctorsDirectory() {
  const [params] = useSearchParams();
  const setHasNext = useOutletContext<(hasNext: boolean) => void>();

  const {
    data: { entities: doctors = [], hasNext = false } = {},
    isPending,
    isError,
    isFetching,
  } = useGetDoctors(Object.fromEntries(params.entries()));

  useEffect(
    function () {
      setHasNext(hasNext ?? false);
    },
    [hasNext, setHasNext],
  );

  if (isPending || isFetching) {
    return <Spinner />;
  }

  if (isError) {
    return null;
  }

  return doctors.map((dr) => (
    <CardFlippable
      key={dr.id}
      entity={dr}
      CardFront={<DrCardFront doctor={dr} />}
    />
  ));
}
