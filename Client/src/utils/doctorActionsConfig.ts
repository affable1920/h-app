import type { Status } from "@/types/doctorAPI";
import type { DrCTA } from "@/types/doctorActions";

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

export default actionConfigs;
