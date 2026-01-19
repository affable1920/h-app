import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import Button from "../common/Button";

import type { DoctorSummary } from "../../types/doctorAPI";
import { CalendarFold, PhoneOutgoing, User, Waypoints } from "lucide-react";
import getActionsByStatus from "@/utils/doctorActionsConfig";

const iconMap: Record<string, any> = {
  profile: User,
  message: Waypoints,
  call: PhoneOutgoing,
  schedule: CalendarFold,
};

const DrCardSecondaryInfo = React.memo(
  ({ doctor }: { doctor: DoctorSummary }) => {
    const actions = useMemo(
      function () {
        return getActionsByStatus(doctor.status);
      },
      [doctor.status],
    );

    const navigate = useNavigate();

    return (
      <div className="flex items-center italic gap-1 self-end mt-2">
        {(actions || []).map((action, i) => {
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
              onClick={() => navigate(`/doctor/${doctor.id}/schedule`)}
            >
              {label}
              {Icon && <Icon />}
            </Button>
          );
        })}
      </div>
    );
  },
);

export default DrCardSecondaryInfo;
