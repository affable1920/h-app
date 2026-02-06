import Card from "@components/Card";
import Spinner from "@components/Spinner";

import { useGetAll } from "@/hooks/doctors";

import DrCardBack from "./DrCardBack";
import type { Doctor } from "@/types/http";

import DrCardEssentials from "./DrCardEssentials";
import DrCardSecondaryInfo from "./DrCardSecondaryInfo";

function DrCardFront({ drEssentials }: { drEssentials: Doctor }) {
  return (
    <article className="flex flex-col gap-8">
      <DrCardEssentials doctor={drEssentials} />
      <DrCardSecondaryInfo doctor={drEssentials} />
    </article>
  );
}

function DoctorsDirectory() {
  const { data, isPending } = useGetAll();

  if (isPending) return <Spinner />;

  return (data?.entities || []).map((doctor) => (
    <Card
      key={doctor.id}
      entity={doctor}
      CardBack={<DrCardBack doctor={doctor} />}
      CardFront={<DrCardFront drEssentials={doctor as Doctor} />}
    />
  ));
}

export default DoctorsDirectory;
