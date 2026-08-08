import { useGetAll } from "@/hooks/use-clinics";

import Card from "./Card";
import Spinner from "./ui/Spinner";
import Ratings from "./Ratings";
import { Link, useOutletContext } from "react-router-dom";
import { useEffect } from "react";
import { Stack } from "./ui/Stack";
import Button from "./ui/Button";

function ClinicsDirectory() {
  const setHasNext = useOutletContext<(hasNext: boolean) => void>();

  const {
    data: { entities: clinics = [], hasNext = false } = {},
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

  return clinics.map(function (clinic) {
    return (
      <Card
        key={clinic.id}
        entity={clinic}
        CardFront={
          <Stack orientation="V">
            <Stack>
              <Stack className="gap-1!" orientation="V">
                <Link to={`/view/clinic/${clinic.id}`}>
                  <h2 className="line-clamp-1 truncate capitalize text-text-normal">
                    {clinic.name}
                  </h2>
                </Link>
                <h2 className="line-clamp-1 text-text-secondary text-sm">
                  {clinic.location}
                </h2>
              </Stack>

              <Link to={`/view/doctor/${clinic.id}/reviews`}>
                <Stack
                  data-tooltip={`Rated ${clinic.rating} across ${clinic.reviews.length} reviews`}
                  gap="xs"
                  align="center"
                >
                  {!!clinic.rating && <Ratings rating={clinic.rating} />}
                </Stack>
              </Link>
            </Stack>

            <Stack gap="xs" justify="end" align="center">
              <Button color="secondary">Check all facilities</Button>
              <Button color="brand">View all Doctors</Button>
            </Stack>
          </Stack>
        }
      />
    );
  });
}

export default ClinicsDirectory;
