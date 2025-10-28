import type { Status } from "@/types/doctorAPI";
import type { DrCTA } from "@/types/doctorActions";

const callAction: DrCTA = {
  name: "call",
  icon: "call",
  label: "consult now",
};

const scheduleAction: DrCTA = {
  name: "schedule",
  icon: "calendar",
  label: "schedule",
};

const messageAction: DrCTA = {
  name: "message",
  icon: "offline",
  label: "Leave a message",
};

const profileAction: DrCTA = {
  name: "profile",
  icon: "user",
  label: "View Profile",
};

const actionConfigs: Record<Status, DrCTA[]> = {
  available: [
    {
      ...callAction,
      isPrimary: true,
    },
    {
      ...scheduleAction,
      needsDD: true,
    },
  ],

  busy: [
    {
      ...scheduleAction,
      needsDD: true,
      isPrimary: true,
    },
    {
      ...callAction,
      needsDD: true,
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

  unknown: [
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
