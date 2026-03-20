import { ShieldCheck } from "lucide-react";
import docImg from "@/assets/doctor.jpg";
import { Link, useNavigate } from "react-router-dom";
import Ratings from "../Ratings";
import type { DoctorSummary } from "@/types/http";
import getActions from "@/utils/doctorActionsConfig";
import { useMemo } from "react";
import Button from "./Button";

function DrCardFront({ doctor }: { doctor: DoctorSummary }) {
  const navigate = useNavigate();

  const actions = useMemo(
    function () {
      return getActions(doctor.status, {
        consult: (doctor: DoctorSummary) =>
          navigate(`/doctor/${doctor.id}/consult`),

        schedule: (doctor: DoctorSummary) =>
          navigate(`/doctor/${doctor.id}/schedule`),

        message: (doctor: DoctorSummary) =>
          navigate(`/doctor/${doctor.id}/message`),
      });
    },
    [doctor.status, navigate],
  );

  return (
    <div className="flex flex-col gap-8">
      <section className="flex gap-2">
        <div className="h-full w-full aspect-square bg-slate-100/30 rounded-md max-w-20">
          <img
            className="h-full hover:scale-95 cursor-pointer w-full object-cover 
          mix-blend-multiply transition-transform duration-150"
            src={docImg}
            alt="doc_img"
          />
        </div>
        <div className="flex flex-col justify-between max-w-40">
          <div className="flex flex-col gap-0.5">
            <div className="flex gap-1 items-center">
              <Link to={`/doctor/${doctor.id}`}>
                <h2 className="card-h2 line-clamp-1 truncate hover:text-slate-800">
                  Dr. {doctor.name}
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

      {/* Rest */}

      <div className="flex items-center italic gap-1 self-end justify-self-end mt-2">
        {(actions || []).map((action) => {
          const { name, label = "", icon: Icon } = action;

          return (
            <Button
              name={name}
              key={action.label || name}
              {...(action.isPrimary
                ? { variant: "contained", color: "secondary" }
                : { variant: "outlined" })}
              onClick={() => action.handler(doctor)}
              style={{ order: action.isPrimary ? 1 : -1 }}
            >
              {label}
              {Icon && <Icon />}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

export default DrCardFront;
