import { CONSULTATION_DURATION, DAYS_OF_WEEK } from "../utilities/constants";

export type Consultation = "inPerson" | "online";

export type Fee = {
  [K in Consultation]?: number;
};

export type Status = "available" | "away" | "busy" | "unknown";

export type TimeSlot = {
  start?: string;
  booked?: boolean;
  mode?: Consultation;
  duration: (typeof CONSULTATION_DURATION)[number];
};

export interface DayInfo {
  start?: string;
  end?: string;
  clinic?: Clinic;
  slots?: TimeSlot[];
  totalHoursAvailable?: number;
  weekday?: (typeof DAYS_OF_WEEK)[number];
}

export type Location = {
  lat: number;
  lng: number;
};

export interface Clinic {
  id: string;
  name: string;
  address: string;
  contact: string;
  whatsApp?: string;
  location?: Location;
  facilities?: string[];
  parkingAvailable?: boolean;
}

export type Schedule = DayInfo[];
