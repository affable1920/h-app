import React, { useMemo, type ReactNode } from "react";

import { SlCallOut } from "react-icons/sl";
import { BsFillCalendar2CheckFill } from "react-icons/bs";
import { BiLocationPlus, BiMessage } from "react-icons/bi";

import Button from "./Button";
import type { Doc } from "../types/doc";
import { TbUser } from "react-icons/tb";

const Consult = (
  <>
    Consult Now <SlCallOut />
  </>
);
const LeaveMessage = (
  <>
    Leave a message
    <BiMessage />
  </>
);
const Schedule = (
  <>
    Schedule <BsFillCalendar2CheckFill />
  </>
);

const customConfig = {
  available: {
    currStatus: "available now",
    bg: "bg-success",
    textColor: "text-success",
    subText: "In person",
    primaryAction: Consult,
    secondaryAction: Schedule,
  },

  busy: {
    currStatus: "in session",
    subText: `in patient rn.`,
    bg: "bg-warning",
    textColor: "text-warning",
    primaryAction: Consult,
    secondaryAction: Schedule,
  },

  away: {
    currStatus: "away",
    bg: "bg-error",
    textColor: "text-error",
    subText: "Likely back tomorrow",
    primaryAction: Schedule,
    secondaryAction: LeaveMessage,
  },

  unknown: {
    currStatus: "offline",
    bg: "bg-secondary",
    textColor: "text-secondary opacity-60",
    subText: "Check availability",
    primaryAction: (
      <>
        View Profile <TbUser />
      </>
    ),
    secondaryAction: LeaveMessage,
  },
};
const DrCardSecondaryInfo = React.memo(({ doctor }: { doctor: Doc }) => {
  const config: Record<string, string | ReactNode> = useMemo(
    () => customConfig[doctor.status || "unknown"],
    [doctor.status]
  );

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
                    config.currStatus as string
                  ) && "animate-pulse"
                }`}
              />
              <h2 className={`${config.textColor}`}>{config.currStatus}</h2>
            </div>
          </div>

          <div className="italic flex items-center gap-1 flex-row-reverse cursor-pointer">
            <p className="rotate-6">
              <BiLocationPlus />
            </p>
            <h2 className="line-clamp-1">
              {doctor.office?.name ?? doctor.clinics[0]?.name}
            </h2>
          </div>
        </div>

        <div className="flex items-center italic gap-1 self-end">
          <Button variant="outlined">{config.secondaryAction}</Button>
          <Button color="accent" variant="contained">
            {config.primaryAction}
          </Button>
        </div>
      </section>
    </section>
  );
});

export default DrCardSecondaryInfo;
