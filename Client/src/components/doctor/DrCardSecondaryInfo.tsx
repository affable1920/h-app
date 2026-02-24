import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import Button from "../common/Button";
import type { Doctor } from "@/types/http";
import getActions from "@/utils/doctorActionsConfig";

const DrCardSecondaryInfo = ({ doctor }: { doctor: Doctor }) => {
  const navigate = useNavigate();

  const actions = useMemo(
    () =>
      getActions(doctor.status, {
        consult: (doctor: Doctor) => navigate(`/doctor/${doctor.id}/consult`),
        schedule: (doctor: Doctor) => navigate(`/doctor/${doctor.id}/schedule`),
        message: (doctor: Doctor) => navigate(`/doctor/${doctor.id}/message`),
      }),
    [doctor.status, navigate],
  );

  return (
    <div className="flex items-center italic gap-1 self-end justify-self-end mt-2">
      {(actions || []).map((action, i) => {
        const { name, label = "", icon: Icon } = action;

        return (
          <Button
            name={name}
            key={`${action.label}-${i}`}
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
  );
};

export default DrCardSecondaryInfo;
