import type { Status } from "@/types/doctorAPI";

type DrActionName = "call" | "schedule" | "message" | "profile";

type DrCTA = {
  label: string;
  name: DrActionName;
  isPrimary?: boolean;
  showsModal?: boolean;
};

const callAction: DrCTA = {
  name: "call",
  label: "consult now",
};

const scheduleAction: DrCTA = {
  name: "schedule",
  label: "schedule",
};

const messageAction: DrCTA = {
  name: "message",
  label: "Get in touch",
};

const profileAction: DrCTA = {
  name: "profile",
  label: "View profile",
};

export default function getActionsByStatus(status: Status) {
  const actionConfigs: Record<Exclude<Status, "unknown">, DrCTA[]> = {
    available: [
      {
        ...callAction,
        isPrimary: true,
      },
      {
        ...scheduleAction,
        showsModal: true,
      },
    ],

    in_patient: [
      {
        ...scheduleAction,
        showsModal: true,
        isPrimary: true,
      },
      {
        ...callAction,
        showsModal: true,
      },
    ],

    away: [
      {
        ...messageAction,
        isPrimary: true,
      },
      {
        ...profileAction,
      },
    ],
  };

  return actionConfigs[status];
}
