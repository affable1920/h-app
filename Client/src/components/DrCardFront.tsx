import { ShieldCheck } from "lucide-react";
import docImg from "@/assets/doctor.webp";
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
    <Stack orientation="V" gap="sm">
      <Stack gap={10} align="start">
        <div className="aspect-square rounded-xl overflow-hidden max-w-20 mix-blend-difference">
          <img
            className="h-full rounded-md cursor-pointer w-full object-cover"
            src={doctor?.imageUrl ?? (docImg as string)}
            alt={`Dr. ${doctor.name}`}
          />
        </div>
        <Stack orientation="V">
          <Stack orientation="V" gap={2}>
            <Stack gap={6} align="center">
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
            <Stack align="center" className="text-[10px]">
              <h2 className="line-clamp-1 text-text-secondary">
                {doctor.primarySpecialization}
              </h2>
              {!!doctor.experience && <p>({doctor.experience}y)</p>}
            </Stack>
          </Stack>
          <Link to={`/view/doctor/${doctor.id}/reviews`}>
            <Stack
              data-tooltip={`Rated ${doctor.rating} across ${doctor.reviewCount} reviews`}
              gap="xs"
              align="center"
            >
              {!!doctor.rating && <Ratings rating={doctor.rating} />}
            </Stack>
          </Link>
        </Stack>
      </Stack>

      <Stack justify="end" align="end" gap={10}>
        {(actions || []).map(function (action) {
          const { name, label = "", icon: Icon } = action;
          return (
            <Button
              name={name}
              key={action.label || name}
              {...(action.isPrimary
                ? {
                    variant: "contained",
                    color: "white",
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
