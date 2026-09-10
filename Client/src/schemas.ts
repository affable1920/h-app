import { z } from "zod";
import { WEEKDAYS } from "@/utils/constants";

export const PatientCreateSchema = z.object({
  username: z.string().min(4, "Please enter a valid username"),
  email: z.email("a valid email id is required"),
  password: z.string().min(6, "password must be atleast 6 characters long"),
});
export type PatientCreate = z.infer<typeof PatientCreateSchema>;

// ===========================================================================
export const DrLoginSchema = z.object({
  id: z.string().optional(),
  email: z.email().optional(),
  password: z.string().min(6),
});
export type DoctorLogin = z.infer<typeof DrLoginSchema>;

// ===========================================================================
export const PatientSigninSchema = z.object({
  email: z.email("An email address is required."),
  password: z
    .string("A password is required.")
    .min(6, "A password must have atleast 6 characters"),
});
export type PatientSignin = z.infer<typeof PatientSigninSchema>;

// ===========================================================================
const MAX_SIZE = 1;
export const stepIdentity = z.object({
  profile: z
    .transform(function (fl) {
      return fl instanceof FileList && fl.length > 0 ? fl.item(0) : null;
    })
    .refine(function (file) {
      return !file || (file?.size ?? 0) <= MAX_SIZE * 1024 * 1024;
    }, `file size must not be greater than ${MAX_SIZE}mb!`)
    .default(null),
  name: z
    .string({ error: "A name is required" })
    .min(4, "Name must have atleast 4 characters"),
  gender: z.enum(["male", "female"] as const, {
    error: "Please select your gender",
  }),
});

export const stepCredentials = z.object({
  degree: z.string().min(3, { error: "Please enter a valid degree name" }),
  medical_college: z.string(),
  graduation_year: z
    .number({ error: "Enter a valid year" })
    .min(4, { error: "Enter a valid year" }),
  license_number: z.string().min(4, { error: "Enter a valid license number" }),
  experience: z.number().nullable(),
});

export const stepCraft = z.object({
  primary_specialization: z.string({
    error: "A primary field of practice is required",
  }),
  secondary_focus_areas: z
    .union([
      z.array(z.string()),
      z.string().transform(function (v) {
        return v
          ? v.split(",").map(function (v) {
              return v.trim();
            })
          : [];
      }),
    ])
    .default([]),
  bio: z.string().nullable().optional(),
});

export const stepAuth = z.object({
  email: z.email({ error: "A valid email address is required" }),
  password: z.string().min(6, "Password must have atleast 6 characters."),
  phone: z.string().nullable().optional(),
});

export const DoctorOnboardingSchema = stepIdentity
  .extend(stepCredentials.shape)
  .extend(stepCraft.shape)
  .extend(stepAuth.shape);
export type DoctorOnboarding = z.infer<typeof DoctorOnboardingSchema>;

// ===========================================================================
const weeklySchema = z.object({
  weekdays: z
    .array(z.number().min(1).max(7), "select atleast one weekday")
    .min(1, "select atleast one weekday")
    .nonempty("select at least one weekday"),
  every: z.literal("week", "A repeating time frame is required."),
});

const monthlySchema = z.object({
  dates: z.array(z.number().min(1).max(31)),
  every: z.literal("month", "A repeating time frame is required."),
});

const stepTwoCommons = z.object({
  baseSlotDuration: z.number().min(5, "Minimum duration is 10 minutes"),
  autoRepeat: z.boolean(),
  setActive: z.boolean(),
  startTime: z
    .string("start time is required")
    .regex(/^\d{2}:\d{2}$/, "Invalid time format"),
  endTime: z
    .string("end time is required")
    .regex(/^\d{2}:\d{2}$/, "Invalid time format"),
  location: z
    .string("A valid location or a clinic name is required")
    .min(8, "A valid location or a clinic name is required"),
  maxSlots: z.union([z.number(), z.literal(false)]).optional().default(false),
  allowOnlineConsultations: z.boolean(),
});

const stepTwoA = weeklySchema.extend(stepTwoCommons.shape);
const stepTwoB = monthlySchema.extend(stepTwoCommons.shape);

export const ScheduleCreateSchema = stepTwoA;
export type ScheduleCreate = z.infer<typeof ScheduleCreateSchema>;
