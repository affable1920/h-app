import Card from "@components/Card";
import Spinner from "@components/Spinner";

import useDoctorsQueries from "@/hooks/useDoctorsQueries";

import DrCardBack from "./DrCardBack";
import type { DoctorSummary } from "@/types/doctorAPI";

import DrCardEssentials from "./DrCardEssentials";
import DrCardSecondaryInfo from "./DrCardSecondaryInfo";

function DrCardFront({ drEssentials }: { drEssentials: DoctorSummary }) {
  return (
    <article className="flex flex-col gap-8">
      <DrCardEssentials doctor={drEssentials} />
      <DrCardSecondaryInfo doctor={drEssentials} />
    </article>
  );
}

function DoctorsDirectory() {
  const { getAll } = useDoctorsQueries();
  const all = getAll();

  if (all.isPending) return <Spinner />;

  return (all.data?.entities || []).map((doctor) => (
    <Card
      key={doctor.id}
      entity={doctor}
      CardBack={<DrCardBack doctor={doctor} />}
      CardFront={<DrCardFront drEssentials={doctor} />}
    />
  ));
}

export default DoctorsDirectory;
