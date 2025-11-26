import React from "react";
import { useNavigate } from "react-router-dom";

import { type IconType } from "react-icons/lib";
import { DrActionService } from "@/services/DrActionService";

import Button from "../eventElements/Button";
import { capitalize } from "../../utils/appUtils";

import type { DrActionName } from "@/types/doctorActions";
import type { DoctorEssentials } from "../../types/doctorAPI";

import { PiPlugsConnectedDuotone } from "react-icons/pi";
import { CalendarFold, PhoneOutgoing, User } from "lucide-react";

const iconMap: Record<DrActionName, IconType> = {
  profile: User,
  message: PiPlugsConnectedDuotone,
  call: PhoneOutgoing,
  schedule: CalendarFold,
};

const DrCardSecondaryInfo = React.memo(
  ({ doctor }: { doctor: DoctorEssentials }) => {
    const dr = new DrActionService(doctor);
    const navigate = useNavigate();

    return (
      <section className="flex flex-col text-sm capitalize">
        <section className="flex flex-col mt-auto gap-2 relative">
          <div className="flex flex-col items-end gap-1">
            {/* <div
            className={`flex items-center gap-1 italic text-base text-shadow-2xs ${getColorConfig(
              doctor.status
            )}`}
          >
            {doctor.status}
          </div> */}
          </div>

          <div className="flex items-center italic gap-1 self-end">
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
                  {capitalize(label)} {Icon && <Icon size={12} />}
                </Button>
              );
            })}
          </div>
        </section>
      </section>
    );
  }
);

export default DrCardSecondaryInfo;
