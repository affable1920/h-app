import Spinner from "./Spinner";
import useClinicsQuery from "@/hooks/useClinicsQuery";

const ClinicsDirectory = () => {
  const { data: clinics, isPending, isError } = useClinicsQuery();

  if (isPending) return <Spinner loading={isError} />;
  if (isError) return;

  return (clinics || []).map((cl) => <div>{cl.name}</div>);
};

export default ClinicsDirectory;
