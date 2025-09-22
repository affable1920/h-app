import { TbUser } from "react-icons/tb";
import { IoLocation } from "react-icons/io5";
import { SlCallOut } from "react-icons/sl";
import type { IconType } from "react-icons/lib";
import { BsFillCalendar2Fill } from "react-icons/bs";
import { MdMore, MdOfflineBolt } from "react-icons/md";

export const iconMap: Record<string, IconType> = {
  more: MdMore,
  user: TbUser,
  call: SlCallOut,
  location: IoLocation,
  offline: MdOfflineBolt,
  calendar: BsFillCalendar2Fill,
};

// data specific
export const SPECIALIZATIONS = [
  "Cardiology",
  "Dermatology",
  "Endocrinology",
  "Family Medicine",
  "Gastroenterology",
  "Hematology",
  "Internal Medicine",
  "Neurology",
  "Obstetrics & Gynecology",
  "Oncology",
  "Ophthalmology",
  "Orthopedics",
  "Pediatrics",
  "Psychiatry",
  "Pulmonology",
  "Radiology",
  "Rheumatology",
  "Surgery",
  "Urology",
] as const;

export const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export const TIME_SLOTS = [
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
  "03:30 PM",
  "04:00 PM",
  "04:30 PM",
  "05:00 PM",
] as const;

export const QUALIFICATIONS = [
  "MBBS",
  "MD",
  "MS",
  "DNB",
  "DM",
  "MCh",
  "FRCS",
  "PhD",
] as const;

export const LANGUAGES = [
  "English",
  "Spanish",
  "French",
  "German",
  "Mandarin",
  "Arabic",
  "Hindi",
  "Portuguese",
  "Russian",
  "Japanese",
] as const;

export const HOSPITALS = [
  "City General Hospital",
  "Metropolitan Medical Center",
  "St. Mary's Hospital",
  "Unity Healthcare",
  "Central Hospital",
  "Memorial Hospital",
  "Regional Medical Center",
  "Community Health Center",
  "University Medical Center",
  "Mercy Hospital",
] as const;

export const EXPERIENCE_RANGE = {
  MIN_YEARS: 2,
  MAX_YEARS: 35,
} as const;

export const CONSULTATION_DURATION = [
  15, // 15 minutes
  30, // 30 minutes
  45, // 45 minutes
  60, // 1 hour
] as const;

export const RATING_RANGE = {
  MIN: 3.5,
  MAX: 5.0,
} as const;

export const CONSULTATION_FEE_RANGE = {
  MIN: 50,
  MAX: 500,
} as const;

export const CREDENTIALS = [
  "MD (Cardiology), DMCC",
  "MD (Family Medicine), DMPH",
  "MD (Internal Medicine), DMPA",
  "MD (Neurology), DMCR",
  "MD (Ophthalmology), DMO",
  "MD (Pediatrics), DMP",
  "MD (Surgery), DMS",
  "MD (Urology), DMRCC",
  "MD (Obstetrics & Gynecology), DMOH",
  "MD (Oncology), DMCH",
  "MD (Endocrinology), DMRCP",
  "MD (Gastroenterology), DMCR",
  "MD (Hematology), DMRCC",
  "MD (Pulmonology), DMRCP",
  "MD (Rheumatology), DMRCC",
  "MD (Dermatology), DDVL",
  "MD (Radiology), DMRD",
  "MD (Psychiatry), DPM",
  "MD (Internal Medicine), MRCP",
] as const;

export const STATUSES = ["available", "busy", "away", "unknown"] as const;

// Types for type safety
export type Specialization = (typeof SPECIALIZATIONS)[number];
export type DayOfWeek = (typeof DAYS_OF_WEEK)[number];
export type TimeSlot = (typeof TIME_SLOTS)[number];
export type Qualification = (typeof QUALIFICATIONS)[number];
export type Language = (typeof LANGUAGES)[number];
export type Hospital = (typeof HOSPITALS)[number];
export type ConsultationDuration = (typeof CONSULTATION_DURATION)[number];
export type CREDENTIALS = (typeof CREDENTIALS)[number];
export type STATUSES = (typeof STATUSES)[number];
