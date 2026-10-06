import { DateTime } from "luxon";
import { z } from "zod";

const recurringFields = {
  startsOn: z.iso.date().default(() => DateTime.local().toISODate()),
  endsOn: z.iso.date().nullable().default(null),
  interval: z.number().int().min(1).default(1),
};

const OneOffRecurrenceSchema = z.strictObject({
  kind: z.literal("one-off"),
  date: z.iso.date(
    "A schedule date is necessary for your one-off schedule  ..",
  ),
});

const WeeklyRecurrenceSchema = z
  .strictObject({
    ...recurringFields,
    kind: z.literal("weekly"),
    weekdays: z
      .array(z.number().int().min(1).max(7))
      .min(1, "At least a single weekday is required for your schedule ..")
      .max(7),
  })
  .refine(
    function (rule) {
      return rule.endsOn === null || rule.endsOn >= rule.startsOn;
    },
    {
      error: "End date cannot be before start date",
      path: ["endsOn"],
    },
  );

const MonthlyRecurrenceSchema = z
  .strictObject({
    ...recurringFields,
    kind: z.literal("monthly"),
    monthDays: z
      .array(z.number().int().min(1).max(31))
      .min(1, "At least a single date is required for your schedule ..")
      .max(31),
  })
  .refine(
    function (rule) {
      return rule.endsOn === null || rule.endsOn >= rule.startsOn;
    },
    {
      error: "End date cannot be before start date",
      path: ["endsOn"],
    },
  );

const RecurrenceSchema = z.discriminatedUnion(
  "kind",
  [OneOffRecurrenceSchema, WeeklyRecurrenceSchema, MonthlyRecurrenceSchema],
  "A valid schedule type is required ..",
);

/**
 *
  The important translations are:
  Python/Pydantic	Zod
  Literal["weekly"]	z.literal("weekly")
  Integer with bounds	z.number().int().min(...).max(...)
  Date	z.iso.date() validates a date string
  Date | None = None	z.iso.date().nullable().default(null)
  extra="forbid"	z.strictObject(...)
  Model validator	.refine(...)
  discriminator="kind"
 */

function toMinutes(value: string): number {
  const [hours = 0, minutes = 0] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

export const ScheduleCreateSchema = z
  .strictObject({
    clinicId: z.uuid("A clinic name is required .."),

    timezone: z.literal("Asia/Kolkata").default("Asia/Kolkata"),

    startTime: z.iso.time({
      precision: -1,
      error: "A valid time is required ..",
    }),

    endTime: z.iso.time({
      precision: -1,
      error: "A valid time is required ..",
    }),

    baseSlotDuration: z
      .number()
      .int()
      .multipleOf(5, "Duration must be in multiples of 5 ..")
      .min(5, "A consultation must have a duration of at least 5 minutes .."),

    maxSlots: z
      .number("max slots must either be turned off or be a valid number ..")
      .int()
      .min(1, "slot limit when turned on must be at least equal to 1 ..")
      .nullable()
      .default(null),
    isActive: z.boolean().default(true),
    allowOnlineConsultations: z.boolean().default(false),

    recurrence: RecurrenceSchema,
  })
  .refine(
    function (schedule) {
      return schedule.endTime > schedule.startTime;
    },
    {
      error: "End time must be after start time",
      path: ["endTime"],
    },
  )
  .refine(
    function (schedule) {
      return (
        toMinutes(schedule.endTime) - toMinutes(schedule.startTime) >=
        schedule.baseSlotDuration
      );
    },
    {
      error: "The time window must fit at least one slot",
      path: ["baseSlotDuration"],
    },
  );

export type ScheduleCreate = z.infer<typeof ScheduleCreateSchema>;
