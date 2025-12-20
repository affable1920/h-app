import Card from "@components/Card";
import Button from "../common/Button";
import Spinner from "@components/Spinner";

import { useAllDoctors } from "@/hooks/useDoctorsQuery";

import DrCardBack from "./DrCardBack";
import type { DoctorSummary } from "@/types/doctorAPI";

import DrCardEssentials from "./DrCardEssentials";
import DrCardSecondaryInfo from "./DrCardSecondaryInfo";

function DrCardFront({ drEssentials }: { drEssentials: DoctorSummary }) {
  return (
    <article className="flex flex-col gap-4">
      <DrCardEssentials doctor={drEssentials} />
      <DrCardSecondaryInfo doctor={drEssentials} />
    </article>
  );
}

function DoctorsDirectory() {
  const { isPending, data: { entities = [], total_count } = {} } =
    useAllDoctors();

  if (isPending) return <Spinner />;

  // if (applied_filters && !total_count) {
  //   return (
  //     <div className="flex flex-col justify-center items-center gap-2 mt-4">
  //       <h2 className="text-lg uppercase font-bold font-mono">
  //         No matching doctors found!
  //       </h2>
  //       <div className="flex items-center gap-2">
  //         <Button onClick={reset} size="md">
  //           Reset filters
  //         </Button>
  //       </div>
  //     </div>
  //   );
  // }

  // console.log(applied_filters);

  return (entities || []).map((doctor) => (
    <Card
      key={doctor.id}
      entity={doctor}
      CardBack={<DrCardBack doctor={doctor} />}
      CardFront={<DrCardFront drEssentials={doctor} />}
    />
  ));
}

export default DoctorsDirectory;
