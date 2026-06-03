import { useGetAll } from "@/hooks/use-clinics";

import Card from "./Card";
import Spinner from "./ui/Spinner";
import Ratings from "./Ratings";
import { MapPin, Phone } from "lucide-react";
import Button from "./ui/Button";
import docImg from "@/assets/doctor.jpg";

function ClinicsDirectory() {
  const result = useGetAll();

  if (result.isPending) {
    return <Spinner />;
  }

  if (result.isError) {
    return null;
  }

  const { entities: clinics = [] } = result.data;

  return clinics.map(function (clinic) {
    return (
      <Card
        key={clinic.id}
        entity={clinic}
        CardFront={
          <article className="flex flex-col gap-8" id={clinic.id}>
            <header className="flex gap-1">
              <div className="h-full w-full aspect-square bg-slate-100/30 rounded-md max-w-20">
                <img
                  className="h-full hover:scale-95 cursor-pointer w-full object-cover 
          mix-blend-multiply transition-transform duration-150"
                  src={docImg}
                  alt="doc_img"
                />
              </div>
              <div>
                <h1>{clinic?.name}</h1>
                <div className="flex items-center font-semibold mt-1.5 space-x-4">
                  <Ratings rating={clinic?.rating || 0} />
                  <h3 className="underline">({clinic.reviews})</h3>
                </div>
              </div>
            </header>

            <section className="flex items-center italic gap-1 self-end justify-self-end mt-2">
              <Button variant="ghost" endIcon={<MapPin />}>
                location
              </Button>
              <Button color="secondary" endIcon={<Phone />}>
                call
              </Button>
            </section>
          </article>
        }
      />
    );
  });
}

export default ClinicsDirectory;
