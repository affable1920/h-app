import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import Button from "../common/Button";
import type { Doctor } from "@/types/http";
import useModalStore from "@/stores/modalStore";
import getActions from "@/utils/doctorActionsConfig";

const DrCardSecondaryInfo = ({ doctor }: { doctor: Doctor }) => {
  const navigate = useNavigate();

  const actions = useMemo(
    () =>
      getActions(doctor.status, {
        consult: (doctor: Doctor) =>
          useModalStore.getState().openModal("consultation", { dr: doctor }),
        schedule: (doctor: Doctor) => navigate(`/doctor/${doctor.id}/schedule`),
        message: (doctor: Doctor) => navigate(`doctor/${doctor.id}/message`),
      }),
    [doctor.status, navigate],
  );

  return (
    <div className="flex flex-col items-end">
      {doctor.status === "available" && (
        <h2 className="capitalize card-h2 italic text-sm text-success-dark">
          online
        </h2>
      )}
      <div className="flex items-center italic gap-1 self-end mt-2">
        {(actions || []).map((action, i) => {
          const { name, label = "", icon: Icon } = action;

          return (
            <Button
              name={name}
              key={`${action.label}-${i}`}
              {...(action.isPrimary
                ? { variant: "contained", color: "primary" }
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
};

export default DrCardSecondaryInfo;
