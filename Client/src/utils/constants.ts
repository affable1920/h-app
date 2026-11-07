import type { AppointmentStatus } from "@/types/appointment";

export const CLINIC_FACILITIES = [
  "Pathology Lab",
  "X-Ray",
  "Ultrasound",
  "CT Scan",
  "MRI",
  "ECG",
  "Echocardiography",
  "Endoscopy",

  "Emergency Care",
  "ICU",
  "Operation Theatre",
  "Day Care Surgery",
  "Maternity Ward",
  "Dialysis",
  "Vaccination",
  "Pharmacy",
  "Ambulance Service",
];

export const SPECIALIZATIONS = [
  "Cardiology",
  "Neurology",
  "Orthopedics",
  "Dermatology",
  "Pediatrics",
  "Psychiatry",
  "Ophthalmology",
  "ENT",
  "General Medicine",
  "Gastroenterology",
  "Pulmonology",
  "Nephrology",
  "Endocrinology",
  "Oncology",
  "Urology",
  "Gynecology & Obstetrics",
  "Rheumatology",
  "Hematology",
  "Infectious Disease",
  "Emergency Medicine",
  "Anesthesiology",
  "Radiology",
  "Pathology",
  "General Surgery",
  "Plastic Surgery",
  "Neurosurgery",
  "Cardiothoracic Surgery",
  "Vascular Surgery",
  "Dentistry",
  "Physiotherapy",
  "Dietetics & Nutrition",
  "Ayurveda",
  "Homeopathy",
];

export const WEEKDAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export const statusPresentation: Record<
  AppointmentStatus,
  { label: string; classes: string }
> = {
  active: {
    label: "Active",
    classes: "border-indicator/25 bg-indicator/10 text-indicator",
  },
  completed: {
    label: "Completed",
    classes: "border-emerald-300/25 bg-emerald-300/10 text-emerald-300",
  },
  cancelled: {
    label: "Cancelled",
    classes: "bg-layout-raised",
  },
  missed: {
    label: "Missed",
    classes: "border-amber-300/25 bg-amber-300/10 text-amber-300",
  },
};

export const APPOINTMENT_STATUSES: Array<AppointmentStatus> = [
  "active",
  "completed",
  "missed",
  "cancelled",
];

export const APPOINTMENT_STATUSES_SET: Set<string> = new Set(
  APPOINTMENT_STATUSES,
);
