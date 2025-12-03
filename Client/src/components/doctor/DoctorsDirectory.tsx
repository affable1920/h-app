import Card from "@/components/Card";
import { useAllDoctors } from "@/hooks/useDoctorsQuery";

import type { DoctorEssentials } from "@/types/doctorAPI";

import Spinner from "../Spinner";
import DrCardBack from "./DrCardBack";
import DrCardEssentials from "./DrCardEssentials";
import DrCardSecondaryInfo from "./DrCardSecondaryInfo";

import Button from "../common/Button";
import { useSearchParams } from "react-router-dom";

type AppError = {
  msg: string;
  status: number;
  description: string;
  detaial: Record<string, unknown>;
};

function DrCardFront({ drEssentials }: { drEssentials: DoctorEssentials }) {
  return (
    <article className="flex flex-col gap-4">
      <DrCardEssentials doctor={drEssentials} />
      <DrCardSecondaryInfo doctor={drEssentials} />
    </article>
  );
}

function DoctorsDirectory() {
  const {
    isLoading,
    isError,
    error,
    data: { entities = [], applied_filters, total_count } = {},
  } = useAllDoctors();

  const [, setSearchParams] = useSearchParams();

  if (isLoading) return <Spinner />;

  if (applied_filters && !total_count) {
    return (
      <div className="flex flex-col justify-center items-center gap-2 mt-4">
        <h2 className="text-lg uppercase font-bold font-mono">
          No matching doctors found!
        </h2>
        <div className="flex items-center gap-2">
          <Button onClick={() => setSearchParams({})} size="md">
            Reset filters
          </Button>
        </div>
      </div>
    );
  }

  return (entities || []).map((doctor) => (
    <Card
      key={doctor.id}
      entity={doctor}
      CardFront={<DrCardFront drEssentials={doctor} />}
      CardBack={<DrCardBack doctor={doctor} />}
    />
  ));
}

export default DoctorsDirectory;
