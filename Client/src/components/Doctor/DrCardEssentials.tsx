import React from "react";
import { Link } from "react-router-dom";
import docImage from "../../assets/doctor.jpg";
import type { Doctor } from "../../types/Doctor";
import { MdVerifiedUser, MdStar } from "react-icons/md";

const DrCardEssentials = React.memo(({ doctor }: { doctor: Doctor }) => {
  return (
    <section className="flex gap-2">
      <div className="doctor-img-container max-w-20">
        <img className="doctor-img" src={docImage} alt="doc_img" />
      </div>
      <div className="flex flex-col justify-between max-w-40">
        <div className="flex flex-col gap-0.5">
          <div className="flex gap-1 items-center">
            <Link to={`/doctors/${doctor.id}`}>
              <h2 className="card-h2 truncate line-clamp-1 hover:underline hover:text-blue-700">
                Dr. {doctor.name}
              </h2>
            </Link>
            {<MdVerifiedUser color={doctor.verified ? "green" : "red"} />}
          </div>
          <div className="flex gap-2 text-sm">
            <h2 className="card-h2 line-clamp-1">
              {doctor.primary_specialization}
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
