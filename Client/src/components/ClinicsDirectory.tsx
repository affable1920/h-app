import { useGetClinics } from "@/hooks/use-clinics";
import CardFlippable from "./lib/CardFlippable";
import Spinner from "./ui/Spinner";
import Ratings from "./Ratings";
import { Link, useOutletContext, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { Stack } from "./ui/Stack";
import Button from "./lib/button/Button";
import { readGivenFilters } from "@/domain/querying/filtering";
import { clinicFilterDefinitions } from "@/domain/querying/clinic-filters";
import { ShieldCheck } from "lucide-react";

export function ClinicsDirectory() {
  const setHasNext = useOutletContext<(hasNext: boolean) => void>();
  const [params] = useSearchParams();

  const filters = readGivenFilters(params, clinicFilterDefinitions, {
    page: true,
    searchQuery: true,
    sortColumn: true,
    sortOrder: true,
  });

  const {
    data: { entities: clinics = [], hasNext = false } = {},
    isLoading,
    isError,
  } = useGetClinics(filters);

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

  return clinics.map(function (clinic) {
    return (
      <CardFlippable
        key={clinic.id}
        entity={clinic}
        CardFront={
          <Stack orientation="V" gap="sm">
            <Stack gap={10} align="start">
              <div className="aspect-square rounded-xl overflow-hidden max-w-20 mix-blend-difference">
                <img
                  className="h-full rounded-md cursor-pointer w-full object-cover text-xs"
                  src={""}
                />
              </div>
              <Stack orientation="V">
                <Stack orientation="V" gap={2}>
                  <Stack gap={6} align="center">
                    <Link to={`/app/index/doctors/${clinic.id}`}>
                      <h2 className="line-clamp-1 truncate capitalize text-text-normal">
                        Dr. {clinic.name}
                      </h2>
                    </Link>
                    <ShieldCheck
                      size={10}
                      data-tooltip={"not verified"}
                      color={"red"}
                    />
                  </Stack>
                  <Stack align="center" className="text-[10px]">
                    <h2 className="line-clamp-1 text-text-secondary">
                      {clinic.location}
                    </h2>
                  </Stack>
                </Stack>
                <Stack
                  data-tooltip={`Rated ${clinic.rating} across ${clinic.reviewCount} reviews`}
                  gap="xs"
                  align="center"
                >
                  {!!clinic.reviewCount && <Ratings value={clinic.rating} />}
                </Stack>
              </Stack>
            </Stack>

            <Stack justify="end" align="stretch" gap={10}>
              <Button>Check facilities</Button>
              <Button color="white">View doctors</Button>
            </Stack>
          </Stack>
        }
      />
    );
  });
}
