import React, { useMemo } from "react";
import Button from "./Button";
import type { Doc } from "../types/doc";
import { Link } from "react-router-dom";
import { iconMap } from "../types/constants";
import { BiLocationPlus } from "react-icons/bi";
import DoctorService from "../services/DoctorService";

const statusConfig = {
  available: { bg: "bg-success", text: "text-success" },
  busy: { bg: "bg-warning", text: "text-warning" },
  unknown: { bg: "bg-error", text: "text-error" },
  away: { bg: "bg-secondary-dark", text: "text-secondary-dark opacity-60" },
};

const DrCardSecondaryInfo = React.memo(({ doctor }: { doctor: Doc }) => {
  const service = useMemo(() => new DoctorService(doctor.id), [doctor]);

  const status = doctor.status ?? "unknown";
  const config = service.getDoctorInfo(doctor.status);

  return (
    <section className="flex flex-col text-sm capitalize">
      <section className="flex flex-col mt-auto gap-2 relative">
        <div>
          <div className="flex items-center gap-4 justify-end italic">
            <p className="text-black font-bold">Status -</p>
            <div className={`flex items-center gap-2`}>
              <span
                className={`inline-flex w-1 h-1 rounded-full ${statusConfig[status].bg}`}
              />
              <h2 className={`card-h2 ${statusConfig[status].text}`}>
                {doctor.status}
              </h2>
            </div>
          </div>
          <Link
            className={`flex items-center gap-1 font-bold italic justify-end ${
              status === "available"
                ? statusConfig[status].text
                : "text-sky-950"
            } 
            hover:underline underline-offset-2`}
            to="/"
          >
            {doctor.office?.name ?? doctor.clinics[0]?.name}
            <BiLocationPlus />
          </Link>
        </div>

        <div className="flex items-center italic gap-1 self-end">
          {(config || []).map(({ name = "", isPrimary, icon }) => {
            const Icon = iconMap[icon];
            return (
              <Button
                key={name}
                onClick={() => service.getDoctorAction()}
                style={{ order: isPrimary ? 10 : 9 }}
                color={isPrimary ? "accent" : "primary"}
                variant={isPrimary ? "contained" : "outlined"}
              >
                {name[0].toUpperCase() + name.slice(1)} {Icon && <Icon />}
              </Button>
            );
          })}
        </div>
      </section>
    </section>
  );
});

export default DrCardSecondaryInfo;
