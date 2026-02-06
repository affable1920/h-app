import type { ElementType } from "react";
import type { Status, Doctor } from "@/types/http";
import { CalendarFold, PhoneOutgoing, Waypoints } from "lucide-react";

type DrActionName = "consult" | "schedule" | "message";
type ActionHandler = (doctor: Doctor, ...args: any[]) => void;
type ActionConfig = DrCTA & { handler: ActionHandler };

type DrCTA = {
  label: string;
  name: DrActionName;
  isPrimary?: boolean;
  icon?: ElementType;
};

const map: { [K in DrActionName]: any } = {
  message: Waypoints,
  consult: PhoneOutgoing,
  schedule: CalendarFold,
};

const callAction: DrCTA = {
  name: "consult",
  label: "consult now",
  icon: map["consult"],
};

const scheduleAction: DrCTA = {
  name: "schedule",
  label: "schedule",
  icon: map["schedule"],
};

const messageAction: DrCTA = {
  name: "message",
  label: "Get in touch",
  icon: map["message"],
};

export default function getActions(
  status: Status,
  handlers: Record<DrActionName, ActionHandler>,
): ActionConfig[] {
  const config: Record<Exclude<Status, "unknown">, ActionConfig[]> = {
    available: [
      { ...callAction, isPrimary: true, handler: handlers.consult },
      { ...scheduleAction, handler: handlers.schedule },
    ],

    in_patient: [
      { ...scheduleAction, isPrimary: true, handler: handlers.schedule },
      { ...callAction, handler: handlers.consult },
    ],

    away: [
      { ...messageAction, isPrimary: true, handler: handlers.message },
      { ...scheduleAction, handler: handlers.schedule },
    ],
  };

  return config[status];
}
