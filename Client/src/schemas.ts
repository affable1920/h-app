import { DateTime } from "luxon";
import { z } from "zod";

export const PatientCreateSchema = z.object({
  username: z.string().min(4, "Please enter a valid username"),
  email: z.email("a valid email id is required"),
  password: z.string().min(6, "password must be atleast 6 characters long"),
});
export type PatientCreate = z.infer<typeof PatientCreateSchema>;

// ===========================================================================
export const DrLoginSchema = z
  .object({
    id: z.string().optional(),
    email: z.email().optional(),
    password: z
      .string()
      .min(6, "A password must have at least 6 characters .."),
  })
  .refine(
    function (schema) {
      return schema.email !== undefined || schema.id !== undefined;
    },
    {
      error: "Your email or the app-specific id is required to login ..",
      path: ["email", "id"],
    },
  );
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
    .string("A name is required")
    .min(4, "Name must have atleast 4 characters"),
  gender: z.enum(["male", "female"] as const, {
    error: "Please select your gender",
  }),
});

export const stepCredentials = z.object({
  degree: z.string().min(3, "Please enter a valid degree name"),
  medical_college: z.string(),
  graduation_year: z
    .number()
    .min(1950, "Please enter a valid year ..")
    .max(DateTime.now().year, "Graduation year cannot be in the future .."),
  license_number: z.string().min(4, "Enter a valid license number"),
  experience: z
    .number("Experience must be a valid number ..")
    .min(0)
    .nullable(),
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
