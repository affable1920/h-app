import React from "react";
import { type IconType } from "react-icons/lib";
import Button from "../eventElements/Button";
import type { Doctor, Status } from "../../types/doctorAPI";
import { Link } from "react-router-dom";
import { capitalize } from "../../utils/appUtils";
import { Doctor as DR } from "@/services/DoctorModel";
import { CalendarFold, MapPin, PhoneOutgoing, User } from "lucide-react";

const iconMap: Record<string, IconType> = {
  user: User,
  call: PhoneOutgoing,
  location: MapPin,
  calendar: CalendarFold,
};

function getColorConfig(status: Status) {
  const statuses: Record<Status, { bg: string; text: string }> = {
    unknown: { bg: "bg-error", text: "text-error" },
    busy: { bg: "bg-warning", text: "text-warning" },
    available: { bg: "bg-success", text: "text-success text-sky-950" },
    away: { bg: "bg-secondary-dark", text: "text-secondary-dark opacity-60" },
  };

  return statuses[status];
}

const DrCardSecondaryInfo = React.memo(({ doctor }: { doctor: Doctor }) => {
  const dr = new DR(doctor);

  return (
    <section className="flex flex-col text-sm capitalize">
      <section className="flex flex-col mt-auto gap-2 relative">
        <div>
          <div className="flex items-center gap-4 justify-end italic">
            <p className="text-black font-bold">Status -</p>
            <div className={`flex items-center gap-2`}>
              <span
                className={`inline-flex w-1 h-1 rounded-full ${
                  getColorConfig(doctor.status).bg
                }`}
              />
              <h2 className={`card-h2 ${getColorConfig(doctor.status).text}`}>
                {doctor.status}
              </h2>
            </div>
          </div>
          <Link
            className={`flex items-center gap-1 italic justify-end text-sky-900
            hover:underline underline-offset-2 font-black`}
            to="/"
          >
            {doctor.office?.name}
            <MapPin size={10} />
          </Link>
        </div>

        <div className="flex items-center italic gap-1 self-end">
          {(dr.availableActions || []).map((action, i) => {
            const { isPrimary, icon, label = "", name } = action;
            const Icon = iconMap[icon];

            return (
              <Button
                name={name}
                key={`${action.label}-${i}`}
                {...(isPrimary
                  ? { variant: "contained", color: "primary" }
                  : { variant: "outlined" })}
                style={{ order: isPrimary ? 1 : -1 }}
                onClick={() => dr.executeAction(name)}
              >
                {capitalize(label)} {Icon && <Icon size={12} />}
              </Button>
            );
          })}
        </div>
      </section>
    </section>
  );
});

export default DrCardSecondaryInfo;
