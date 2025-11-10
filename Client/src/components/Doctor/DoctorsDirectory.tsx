import Card from "@/components/Card";
import { useAllDoctors } from "@/hooks/useDoctorsQuery";

import type { Doctor } from "@/types/doctorAPI";

import DrCardBack from "./DrCardBack";
import DrCardEssentials from "./DrCardEssentials";
import DrCardSecondaryInfo from "./DrCardSecondaryInfo";
import Button from "../eventElements/Button";
import Spinner from "../Spinner";

function DrCardFront({ doctor }: { doctor: Doctor }) {
  return (
    <>
      <DrCardEssentials doctor={doctor} />
      <DrCardSecondaryInfo doctor={doctor} />
    </>
  );
}

function DoctorsDirectory() {
  const {
    data: { entities = [], applied_filters, total_count } = {},
    isError,
    isLoading,
  } = useAllDoctors();

  if (isError) return;

  if (isLoading) return <Spinner />;

  if (applied_filters && !total_count)
    return (
      <div className="flex flex-col justify-center items-center gap-2">
        <h2 className="text-lg uppercase font-semibold">
          No matching doctors found!
        </h2>
        <Button variant="contained">Refetch</Button>
      </div>
    );

  return (entities || []).map((doctor) => (
    <Card
      key={doctor.id}
      entity={doctor}
      CardFront={<DrCardFront doctor={doctor} />}
      CardBack={<DrCardBack doctor={doctor} />}
    />
  ));
}

export default DoctorsDirectory;
