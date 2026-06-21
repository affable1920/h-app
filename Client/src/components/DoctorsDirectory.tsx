import { useOutletContext } from "react-router-dom";
import { useEffect } from "react";
import Card from "@components/Card";
import Spinner from "@/components/ui/Spinner";
import { useGetAll } from "@/hooks/use-doctors";
import DrCardFront from "./DrCardFront";

function DoctorsDirectory() {
  const { setHasNext } = useOutletContext<{
    setHasNext: (hasNext: boolean) => void;
  }>();

  const {
    data: { entities = [], has_next = true } = {},
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
  console.log(entities[3]);

  return (entities || [])?.map((doctor) => (
    <Card
      key={doctor.id}
      entity={doctor}
      CardFront={<DrCardFront doctor={doctor} />}
    />
  ));
}

export default DoctorsDirectory;
