import Card from "@components/Card";
import Spinner from "@components/Spinner";

import { useGetAll } from "@/hooks/doctors";

import DrCardFront from "./DrCardFront";
import type { DoctorSummary } from "@/types/http";

function DrCardBack({ doctor }: { doctor: DoctorSummary }) {
  return (
    <div className="flex flex-col h-1/2">
      <h2 className="card-h2 grow">{doctor.name}</h2>

      <section className="">
        <div className="italic font-semibold text-sm flex flex-wrap justify-end gap-4 overflow-hidden relative"></div>
      </section>
    </div>
  );
}

function DoctorsDirectory() {
  const { data: { entities } = { entities: [] }, isFetching } = useGetAll();

  if (isFetching) {
    return <Spinner />;
  }

  return entities?.map((doctor) => (
    <Card
      key={doctor.id}
      entity={doctor}
      CardBack={<DrCardBack doctor={doctor} />}
      CardFront={<DrCardFront doctor={doctor} />}
    />
  ));
}

export default DoctorsDirectory;
