import React from "react";
import { Link } from "react-router-dom";
import docImage from "../../assets/doctor.jpg";
import type { DoctorSummary } from "@/types/http";
import Ratings from "../Ratings";
import { ShieldCheck } from "lucide-react";

const DrCardEssentials = React.memo(({ doctor }: { doctor: DoctorSummary }) => {
  return (
    <section className="flex gap-2">
      <div className="h-full w-full aspect-square bg-slate-100/30 rounded-md max-w-20">
        <img
          className="h-full hover:scale-95 cursor-pointer w-full object-cover 
          mix-blend-multiply transition-transform duration-150"
          src={docImage}
          alt="doc_img"
        />
      </div>
      <div className="flex flex-col justify-between max-w-40">
        <div className="flex flex-col gap-0.5">
          <div className="flex gap-1 items-center">
            <Link to={`/doctor/${doctor.id}`}>
              <h2 className="card-h2 line-clamp-1 truncate hover:text-slate-800">
                Dr. {doctor.fullname}
              </h2>
            </Link>
            {
              <ShieldCheck
                size={12}
                color={doctor.verified ? "green" : "red"}
              />
            }
          </div>
          <div className="flex gap-2 text-sm">
            <h2>{doctor.primary_specialization}</h2>
            <p>({doctor.experience}y)</p>
          </div>
        </div>
        <div className="flex gap-2 items-center font-semibold">
          <Ratings rating={doctor?.rating || 0} />
          <h3 className="underline">({doctor.reviews})</h3>
        </div>
      </div>
    </section>
  );
});

export default DrCardEssentials;
