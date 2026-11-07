import type { AppointmentStatus } from "@/types/appointment";
import { APPOINTMENT_STATUSES_SET } from "@/utils/constants";
import type { DefinitionMap } from "./shared";

function isAppointmentStatus(raw: string): raw is AppointmentStatus {
  return APPOINTMENT_STATUSES_SET.has(raw);
}

export const appointmentFilterDefinitions = {
  appointmentStatus: {
    key: "appointmentStatus" as const,
    parse: function (raw): AppointmentStatus | null {
      return raw !== null && isAppointmentStatus(raw) ? raw : null;
    },
    countsAsActive: true,
    resetsPageOnChange: true,
  },
} satisfies DefinitionMap;
