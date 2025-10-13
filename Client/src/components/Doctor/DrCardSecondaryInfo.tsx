import React, { useCallback, useMemo } from "react";
import Button from "../Button";
import type { Doctor } from "../../types/Doctor";
import { Link } from "react-router-dom";
import { iconMap } from "../../utilities/constants";
import { BiLocationPlus } from "react-icons/bi";
import DoctorService from "../../services/DoctorService";
import { capitalize } from "../../utilities/utils";

const statusCssConfig = {
  unknown: { bg: "bg-error", text: "text-error" },
  busy: { bg: "bg-warning", text: "text-warning" },
  available: { bg: "bg-success", text: "text-success text-sky-950" },
  away: { bg: "bg-secondary-dark", text: "text-secondary-dark opacity-60" },
};

const DrCardSecondaryInfo = React.memo(({ doctor }: { doctor: Doctor }) => {
  const service = useMemo(() => new DoctorService(doctor.id), [doctor]);

  const status = doctor.status ?? "unknown";
  const config = service.getDoctorInfo(status);

  const handleClick = useCallback(
    (
      ev: React.MouseEvent<HTMLButtonElement>,
      name: string,
      doctorId: string
    ) => {
      const targetBtn = ev.currentTarget.closest("button") as HTMLButtonElement;
      service.getDoctorAction(doctorId, name, targetBtn);
    },
    [service]
  );

  return (
    <section className="flex flex-col text-sm capitalize">
      <section className="flex flex-col mt-auto gap-2 relative">
        <div>
          <div className="flex items-center gap-4 justify-end italic">
            <p className="text-black font-bold">Status -</p>
            <div className={`flex items-center gap-2`}>
              <span
                className={`inline-flex w-1 h-1 rounded-full ${statusCssConfig[status]?.bg}`}
              />
              <h2 className={`card-h2 ${statusCssConfig[status]?.text}`}>
                {doctor.status}
              </h2>
            </div>
          </div>
          <Link
            className={`flex items-center gap-1 italic justify-end text-sky-900
            hover:underline underline-offset-2 font-black`}
            to="/"
          >
            <BiLocationPlus />
          </Link>
        </div>

        <div className="flex items-center italic gap-1 self-end">
          {(config || []).map((configObject, i) => {
            const { name, isPrimary, icon, label = "" } = configObject;
            const Icon = iconMap[icon];

            return (
              <Button
                key={i}
                {...(isPrimary
                  ? { variant: "contained", color: "accent" }
                  : { variant: "outlined" })}
                style={{ order: isPrimary ? 10 : 9 }}
                onClick={(ev) => handleClick(ev, name, doctor.id)}
              >
                {capitalize(label)} {Icon && <Icon />}
              </Button>
            );
          })}
        </div>
      </section>
    </section>
  );
});

export default DrCardSecondaryInfo;
