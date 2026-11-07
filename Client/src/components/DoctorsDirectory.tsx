import { useOutletContext, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import CardFlippable from "@/components/lib/CardFlippable";
import Spinner from "@/components/ui/Spinner";
import DrCardFront from "./DrCardFront";
import { useGetDoctors } from "@/hooks/use-doctors";
import { readGivenFilters } from "@/domain/querying/filtering";
import { doctorFilterDefinitions } from "@/domain/querying/doctor-filters";

export function DoctorsDirectory() {
  const [params] = useSearchParams();
  const setHasNext = useOutletContext<(hasNext: boolean) => void>();

  const { sortOrder, ...filters } = readGivenFilters(
    params,
    doctorFilterDefinitions,
    {
      searchQuery: true,
      page: true,
      sortColumn: true,
      sortOrder: true,
    },
  );

  const {
    data: { entities: doctors = [], hasNext = false } = {},
    isError,
    isLoading,
  } = useGetDoctors({ sortOrder: sortOrder ?? undefined, ...filters });

  useEffect(
    function () {
      setHasNext(hasNext ?? false);
    },
    [hasNext, setHasNext],
  );

  if (isLoading) {
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
