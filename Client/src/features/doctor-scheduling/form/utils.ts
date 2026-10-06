import type z from "zod";
import { type FieldPath } from "react-hook-form";
import type {
  ScheduleCreate,
  ScheduleCreateSchema,
} from "../contract/create-schema";

export type ScheduleFormInput = z.input<typeof ScheduleCreateSchema>;

type RecurrenceKind = ScheduleCreate["recurrence"]["kind"];
export type ScheduleField = FieldPath<ScheduleFormInput>;

const STEP1 = ["recurrence.kind"] satisfies Array<ScheduleField>;

const WeeklyStep2 = [
  "recurrence.weekdays",
  "startTime",
  "endTime",
  "clinicId",
] satisfies Array<ScheduleField>;

const MonthlyStep2 = [
  "recurrence.monthDays",
  "startTime",
  "endTime",
  "clinicId",
] satisfies Array<ScheduleField>;

const OneOffStep2 = [
  "recurrence.date",
  "startTime",
  "endTime",
  "clinicId",
] satisfies Array<ScheduleField>;

const STEP3 = [
  "baseSlotDuration",
  "maxSlots",
  "isActive",
  "allowOnlineConsultations",
] satisfies Array<ScheduleField>;

const STEP4 = [
  "recurrence.startsOn",
  "recurrence.endsOn",
  "recurrence.interval",
] satisfies Array<ScheduleField>;

export function getSteps<T extends RecurrenceKind>(
  recurrence: T,
): Array<Array<ScheduleField>> {
  switch (recurrence) {
    case "one-off":
      return [STEP1, ["recurrence.date", ...OneOffStep2], STEP3, STEP4];
  }

  switch (recurrence) {
    case "weekly":
      return [STEP1, ["recurrence.weekdays", ...WeeklyStep2], STEP3, STEP4];

    default:
      return [STEP1, ["recurrence.monthDays", ...MonthlyStep2], STEP3, STEP4];
  }
}

//
const ALL_STEPS: Array<Array<ScheduleField>> = [
  ["recurrence.kind"],
  [
    "recurrence.weekdays",
    "recurrence.monthDays",
    "recurrence.date",
    "startTime",
    "endTime",
    "clinicId",
  ],
  ["baseSlotDuration", "maxSlots", "isActive", "allowOnlineConsultations"],
  ["recurrence.startsOn", "recurrence.endsOn", "recurrence.interval"],
];

export function getFirstErrorField(
  errors: Record<string, unknown> = {},
): string | undefined {
  for (const key of Object.keys(errors)) {
    const value = errors[key];

    if (!value) {
      continue;
    }

    if (typeof value !== "object") {
      continue;
    }

    // Leaf: this is a FieldError-like object (has a message), not another nested errors map
    if ("message" in (value as object)) {
      return key;
    }

    if (value) {
      const nested = getFirstErrorField(value as Record<string, unknown>);
      if (nested) {
        return `${key}.${nested}`;
      }
    }
  }

  return undefined;
}

export function getStepWithError(fieldName: ScheduleField): number {
  // helper to get the step of a form field with an error ..
  const idx = ALL_STEPS.findIndex((step) => step.includes(fieldName));
  return idx === -1 ? 0 : idx;
}
