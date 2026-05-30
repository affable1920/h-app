import { z } from "zod";

export const PatientCreateSchema = z.object({
  username: z.string().min(4, "Please enter a valid username"),
  email: z.email("a valid email id is required"),
  password: z.string().min(6, "password must be atleast 6 characters long"),
});

export const DrLoginSchema = z
  .object({
    id: z.string().optional(),
    email: z.email().optional(),
    password: z.string().min(6, "Password is required"),
  })
  .refine(
    function (data) {
      return !!(data.email || data.id);
    },
    { error: "An email or the app-specific id is required", path: ["email"] },
  );

export const PatientLoginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

const MAX_SIZE = 5 * 1024 * 1024;

export const stepIdentity = z.object({
  profile: z
    .custom()
    .transform((v) => (v instanceof FileList && v.length > 0 ? v[0] : null))
    .refine((file) => !file || (file?.size ?? 0) >= MAX_SIZE, "Max size 5MB")
    .default(null),
  name: z.string().min(4, {
    error: "A name is required",
  }),
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
  experience: z.number().nullable().optional(),
});

export const stepCraft = z.object({
  primary_specialization: z.string({
    error: "A primary field of practice is required",
  }),
  secondary_focus_areas: z.union([
    z.string().transform((v) => (v ? v.split(",").map((e) => e.trim()) : [])),
    z.array(z.string()),
  ]),
  bio: z.string().nullable().optional(),
});

export const stepAuth = z.object({
  email: z.email({ error: "A valid email address is required" }),
  password: z.string().min(6, "Password must have atleast 6 characters."),
  phone: z.string().nullable().optional(),
});

export const DrCreateSchema = stepIdentity
  .extend(stepCredentials.shape)
  .extend(stepCraft.shape)
  .extend(stepAuth.shape);

export type DrCreate = z.infer<typeof DrCreateSchema>;
export type DoctorLogin = z.infer<typeof DrLoginSchema>;
