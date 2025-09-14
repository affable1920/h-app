import { Link } from "react-router-dom";
import type { Doc } from "../types/doc";
import docImage from "../assets/doctor.jpg";
import { MdVerifiedUser, MdStar } from "react-icons/md";
import React from "react";

const DrCardEssentials = React.memo(({ doctor }: { doctor: Doc }) => {
  return (
    <section className="flex gap-2">
      <div className="h-full w-full max-w-20 aspect-square bg-slate-100/30 rounded-md">
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
            <Link to="/">
              <h2 className="card-h2 truncate line-clamp-1 hover:underline hover:text-blue-700">
                {doctor.name}
              </h2>
            </Link>
            {<MdVerifiedUser color={doctor.verified ? "green" : "red"} />}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <h2 className="card-h2 line-clamp-1 text-sm">
              {doctor.primarySpecialization}
            </h2>
            <p>({doctor.experience}y)</p>
          </div>
        </div>
        <div className="flex gap-2 items-center font-semibold text-sm">
          <div className="flex">
            {Array.from({ length: 5 }, (_, i) => (
              <MdStar
                key={i + 1}
                className={`${
                  (doctor.rating || 0) >= i + 1 ? "text-orange-500" : ""
                }`}
              />
            ))}
          </div>
          <h3 className="underline">({doctor.reviews})</h3>
        </div>
      </div>
    </section>
  );
});

export default DrCardEssentials;
