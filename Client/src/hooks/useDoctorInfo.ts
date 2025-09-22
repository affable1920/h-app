import type { Doc } from "@/types/doc";
import { useMemo } from "react";

type DropdownAction = {
  items: string[];
  dropdownLabel: string;
};

type Action = {
  icon: string;
  label?: string;
  needsDD?: boolean;
  isPrimary?: boolean;
  options?: DropdownAction;
};

interface DrInfo {
  bg: string;
  subText?: string;
  textColor: string;
  currStatus: string;
  actions?: Action[];
}

const customConfig: Record<string, DrInfo> = {
  available: {
    bg: "bg-success",
    subText: "In person",
    textColor: "text-success",
    currStatus: "available now",
    actions: [
      {
        isPrimary: true,
        icon: "call",
        label: "Consult now",
      },
      {
        icon: "calendar",
        label: "Schedule",
        needsDD: true,
      },
    ],
  },

  busy: {
    currStatus: "in session",
    subText: `in patient rn.`,
    bg: "bg-warning",
    textColor: "text-warning",
    actions: [
      {
        icon: "call",
        label: "Consult now",
      },
      {
        icon: "calendar",
        label: "Schedule",
        needsDD: true,
        isPrimary: true,
        options: {
          dropdownLabel: "Schedule on",
          items: ["Nearest date", "Specific date"],
        },
      },
    ],
  },

  away: {
    currStatus: "away",
    bg: "bg-error",
    textColor: "text-error",
    subText: "Likely back tomorrow",
    actions: [
      {
        isPrimary: true,
        icon: "offline",
        label: "Leave a message",
      },
      {
        icon: "user",
        label: "View Profile",
      },
    ],
  },

  unknown: {
    currStatus: "offline",
    bg: "bg-secondary",
    subText: "Check availability",
    textColor: "text-secondary opacity-60",
    actions: [
      {
        icon: "MdOfflinePin",
        label: "Leave a message",
      },
      {
        icon: "TbUser",
        label: "View Profile",
        isPrimary: true,
      },
    ],
  },
};

const useDoctorInfo = (doctor: Doc): DrInfo => {
  return useMemo(
    () => customConfig[doctor.status || "unknown"],
    [doctor.status]
  );
};

export default useDoctorInfo;
