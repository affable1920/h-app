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
    <Stack orientation="V">
      <Stack>
        <div className="aspect-square rounded-md overflow-hidden max-w-20 mix-blend-difference">
          <img
            className="h-full rounded-md cursor-pointer w-full object-cover"
            src={docImg}
            alt="doc_img"
          />
        </div>
        <Stack orientation="V" align="between">
          <Stack orientation="V" className="gap-1!">
            <Stack gap="xs" align="center">
              <Link to={`/view/doctor/${doctor.id}`}>
                <h2 className="line-clamp-1 truncate capitalize text-text-normal">
                  Dr. {doctor.name}
                </h2>
              </Link>
              <ShieldCheck
                size={12}
                data-tooltip={doctor.verified ? "verified" : "not verified"}
                color={doctor.verified ? "green" : "red"}
              />
            </Stack>
            <Stack gap="xs" align="center" className="text-[10px]">
              <h2 className="line-clamp-1 text-text-secondary">
                {doctor.primary_specialization}
              </h2>
              {!!doctor.experience && <p>({doctor.experience}y)</p>}
            </Stack>
          </Stack>
          <Link to={`/view/doctor/${doctor.id}/reviews`}>
            <Stack
              data-tooltip={`Rated ${doctor.rating} across ${doctor.reviews.length} reviews`}
              gap="xs"
              align="center"
            >
              {!!doctor.rating && <Ratings rating={doctor.rating} />}
            </Stack>
          </Link>
        </Stack>
      </Stack>

      <Stack gap="xs" justify="end" align="end">
        {(actions || []).map((action) => {
          const { name, label = "", icon: Icon } = action;

          return (
            <Button
              name={name}
              key={action.label || name}
              {...(action.isPrimary
                ? {
                    variant: "contained",
                    color: "brand",
                  }
                : {
                    color: "secondary",
                  })}
              border={false}
              onClick={function () {
                action.handler(doctor);
              }}
              style={{ order: action.isPrimary ? 1 : -1, fontStyle: "italic" }}
            >
              {label}
              {Icon && <Icon />}
            </Button>
          );
        })}
      </Stack>
    </Stack>
  );
}

export default DrCardFront;
