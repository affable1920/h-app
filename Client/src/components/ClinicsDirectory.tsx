import Card from "./Card";
import Spinner from "./Spinner";
import useClinicsQuery from "@/hooks/useClinicsQuery";

const ClinicsDirectory = () => {
  const { data: clinics, isPending, isError } = useClinicsQuery();

  if (isPending) return <Spinner loading={isPending} />;
  if (isError) return;

  return (clinics || []).map((clinic) => (
    <Card
      entity={clinic}
      CardFront={<div>{clinic.name}</div>}
      CardBack={<div>{clinic.address}</div>}
    />
  ));
};

export default ClinicsDirectory;
