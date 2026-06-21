import { useGetAll } from "@/hooks/use-clinics";

import Card from "./Card";
import Spinner from "./ui/Spinner";
import Ratings from "./Ratings";
import { Link, useOutletContext } from "react-router-dom";
import { useEffect } from "react";
import { Stack } from "./ui/Stack";
import Button from "./ui/Button";

function ClinicsDirectory() {
  const { setHasNext } = useOutletContext<{
    setHasNext: (hasNext: boolean) => void;
  }>();

  const {
    data: { entities = [], has_next = false } = {},
    isFetching,
    isError,
  } = useGetAll();

  useEffect(
    function () {
      setHasNext(has_next ?? false);
    },
    [has_next],
  );

  if (isFetching) {
    return <Spinner />;
  }

  if (isError) {
    return null;
  }

  return entities.map((clinic) => (
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

            {!!clinic.rating && (
              <Stack gap="xs" align="center" className="font-semibold">
                <Ratings rating={clinic.rating} />
                <p className="text-text-secondary">({clinic.reviews.length})</p>
              </Stack>
            )}
          </Stack>

          <Stack gap="xs" justify="end" align="center">
            <Button color="secondary">Check all facilities</Button>
            <Button color="brand">View all Doctors</Button>
          </Stack>
        </Stack>
      }
    />
  ));
}

export default ClinicsDirectory;
