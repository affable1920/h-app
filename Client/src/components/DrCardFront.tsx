import { ShieldCheck } from "lucide-react";
import docImg from "@/assets/doctor.jpg";
import { Link, useNavigate } from "react-router-dom";
import Ratings from "./Ratings";
import type { Doctor } from "@/types/http";
import getActions from "@/utils/doctor-actions-config";
import { useMemo } from "react";
import Button from "./ui/Button";
import { Stack } from "./ui/Stack";

function DrCardFront({ doctor }: { doctor: Doctor }) {
  const navigate = useNavigate();

  const actions = useMemo(
    function () {
      return getActions(doctor.status ?? "unknown", {
        consult: function (doctor: Doctor) {
          navigate(`/view/doctor/${doctor.id}/consult`);
        },

        schedule: function (doctor: Doctor) {
          navigate(`/view/doctor/${doctor.id}/schedule`);
        },

        message: function (doctor: Doctor) {
          navigate(`/view/doctor/${doctor.id}/message`);
        },
      });
    },
    [doctor.status, navigate],
  );

  return (
    <div className="flex flex-col gap-8">
      <Stack>
        <div className="aspect-square rounded-md overflow-hidden max-w-20">
          <img
            className="h-full hover:scale-95 rounded-md cursor-pointer w-full object-cover 
           transition-transform duration-150"
            src={docImg}
            alt="doc_img"
          />
        </div>
        <div className="flex flex-col justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex gap-2 items-center">
              <Link to={`/view/doctor/${doctor.id}`}>
                <h2 className="card-h2 line-clamp-1 truncate capitalize text-text-normal">
                  Dr. {doctor.name}
                </h2>
              </Link>
              <ShieldCheck
                size={12}
                data-tooltip={doctor.verified ? "verified" : "not verified"}
                color={doctor.verified ? "green" : "red"}
              />
            </div>
            <div className="flex gap-2 text-sm">
              <h2 className="line-clamp-1">{doctor.primary_specialization}</h2>
              {!!doctor.experience && <p>({doctor.experience}y)</p>}
            </div>
          </div>
          <div className="flex gap-2 items-center font-semibold">
            {!!doctor.rating && <Ratings rating={doctor.rating} />}
            {!!doctor.rating && (
              <p className="text-text-secondary">({doctor.reviews.length})</p>
            )}
          </div>
        </div>
      </Stack>

      <div className="italic self-end flex gap-2 justify-end">
        {(actions || []).map((action) => {
          const { name, label = "", icon: Icon } = action;

          return (
            <Button
              name={name}
              key={action.label || name}
              variant="contained"
              color={action.isPrimary ? "brand" : "white"}
              onClick={action.handler.bind(doctor, doctor)}
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
