import React from "react";
import { useNavigate } from "react-router-dom";

import { type IconType } from "react-icons/lib";
import { DrActionService } from "@/services/DrActionService";

import Button from "../common/Button";
import { capitalize } from "../../utils/appUtils";

import type { DrActionName } from "@/types/doctorActions";
import type { DoctorSummary } from "../../types/doctorAPI";

import { PiPlugsConnectedDuotone } from "react-icons/pi";
import { CalendarFold, PhoneOutgoing, User } from "lucide-react";

const iconMap: Record<DrActionName, IconType> = {
  profile: User,
  message: PiPlugsConnectedDuotone,
  call: PhoneOutgoing,
  schedule: CalendarFold,
};

const DrCardSecondaryInfo = React.memo(
  ({ doctor }: { doctor: DoctorSummary }) => {
    const dr = new DrActionService(doctor);
    const navigate = useNavigate();

    return (
      <div className="flex items-center italic gap-1 self-end mt-2">
        {(dr.availableActions || []).map((action, i) => {
          const { isPrimary, label = "", name } = action;
          const Icon = iconMap[name];

          return (
            <Button
              name={name}
              key={`${action.label}-${i}`}
              {...(isPrimary
                ? { variant: "contained", color: "primary" }
                : { variant: "outlined" })}
              style={{ order: isPrimary ? 1 : -1 }}
              onClick={() => navigate(`/doctors/${doctor.id}/schedule`)}
            >
              {label}
              {Icon && <Icon />}
            </Button>
          );
        })}
      </div>
    );
  }
);

export default DrCardSecondaryInfo;
