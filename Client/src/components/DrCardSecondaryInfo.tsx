import React from "react";
import Button from "./Button";
import type { Doc } from "../types/doc";
import { Link } from "react-router-dom";
import { iconMap } from "../types/constants";
import { BiLocationPlus } from "react-icons/bi";
import useDoctorInfo from "../hooks/useDoctorInfo";
import useModalStore from "../stores/modalStore";

// This line below creates an empty object initialised once during this module's import
// Never again - that's why this cache persists - not part of the react render cycle
const positionCache: Record<string, { x: number; y: number } | null> = {};

const DrCardSecondaryInfo = React.memo(({ doctor }: { doctor: Doc }) => {
  const config = useDoctorInfo(doctor);
  const openModal = useModalStore((s) => s.openModal);

  function getPos(ev: React.MouseEvent) {
    if (ev.currentTarget.textContent.trim().toLowerCase() !== "schedule")
      return;

    if (positionCache[doctor.id]) {
      console.log("cache hit");
      openModal("schedule", {
        position: positionCache[doctor.id],
      });
      return;
    }

    positionCache[doctor.id] = null;
    const rect = ev.currentTarget.getBoundingClientRect();
    const position = {
      x: rect.left,
      y: rect.bottom,
    };

    positionCache[doctor.id] = position;
    openModal("schedule", { position });
  }

  return (
    <section className="flex flex-col text-sm capitalize">
      <section className="flex flex-col mt-auto gap-2 relative">
        <div>
          <div className="flex items-center gap-4 justify-end italic">
            <p className="text-black font-bold">Status -</p>
            <div className={`flex items-center gap-2`}>
              <span
                className={`inline-flex w-1 h-1 rounded-full 
                  ${config.bg} ${
                  ["available now", "in session", "busy"].includes(
                    config.currStatus
                  ) && "animate-pulse"
                }`}
              />
              <h2 className={`${config.textColor}`}>{config.currStatus}</h2>
            </div>
          </div>
          <Link
            className="flex items-center gap-1 font-bold italic justify-end text-sky-900 hover:underline"
            to="/"
          >
            {doctor.office?.name ?? doctor.clinics[0]?.name}
            <BiLocationPlus />
          </Link>
        </div>

        <div className="flex items-center italic gap-1 self-end">
          {(config.actions || []).map(({ label, isPrimary, icon }) => {
            const Icon = iconMap[icon];
            return (
              <Button
                key={label}
                style={{ order: isPrimary ? 10 : 9 }}
                color={isPrimary ? "accent" : "primary"}
                variant={isPrimary ? "contained" : "outlined"}
                onClick={getPos}
              >
                {label} {Icon && <Icon />}
              </Button>
            );
          })}
        </div>
      </section>
    </section>
  );
});

export default DrCardSecondaryInfo;
