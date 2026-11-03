import type { AppointmentStatus } from "@/types/appointment";
import { APPOINTMENT_STATUSES_SET } from "./constants";

type FilterValue = string | null;

export type FilterDefinition = {
  key: string;
  parse: (raw: FilterValue) => unknown;
  countsAsActive?: boolean;
  resetsPageOnChange?: boolean;
};

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

  searchQuery: {
    key: "searchQuery" as const,
    parse: function (raw) {
      return raw !== null && raw.trim() !== "" ? raw : null;
    },
    resetsPageOnChange: true,
    countsAsActive: true,
  },

  page: {
    key: "page" as const,
    parse: function (raw) {
      return raw !== null && raw !== undefined && raw !== "" ? Number(raw) : 1;
    },
    countsAsActive: false,
    resetsPageOnChange: false,
  },

  sortOrder: {
    key: "sortOrder" as const,
    parse: function (raw) {
      return raw === "asc" || raw === "desc" ? raw : null;
    },
    countsAsActive: true,
    resetsPageOnChange: true,
  },

  sortColumn: {
    key: "sortColumn" as const,
    parse: function (raw) {
      return raw !== null && raw.trim() !== "" ? raw : null;
    },
    resetsPageOnChange: true,
    countsAsActive: true,
  },
} satisfies Record<string, FilterDefinition>;

export type FilterName = keyof typeof appointmentFilterDefinitions;
export type FilterValues = {
  [K in keyof typeof appointmentFilterDefinitions]: ReturnType<
    (typeof appointmentFilterDefinitions)[K]["parse"]
  >;
};

export function readFilters(params: URLSearchParams): FilterValues {
  return Object.fromEntries(
    Object.entries(appointmentFilterDefinitions).map(([name, definition]) => [
      name,
      definition.parse(params.get(definition.key)),
    ]),
  ) as FilterValues;
}

export function writeFilter(
  prev: URLSearchParams,
  name: FilterName,
  value: string | null,
): URLSearchParams {
  const next = new URLSearchParams(prev);
  const { key, ...definition } = appointmentFilterDefinitions[name];

  const valid = definition.parse(value);

  if (valid === null) {
    next.delete(key);
  } else {
    next.set(key, String(valid));
  }

  if (definition.resetsPageOnChange) {
    next.delete("page");
  }

  return next;
}

export function countActive(params: URLSearchParams): number {
  return Object.values(appointmentFilterDefinitions).reduce(
    (count, definition) => {
      if (!definition.countsAsActive) {
        return count;
      }

      const value = definition.parse(params.get(definition.key));
      return count + (value !== null ? 1 : 0);
    },
    0,
  );
}
