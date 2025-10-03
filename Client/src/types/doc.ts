type Fee = Record<string, string | number | null>;
export type Status = "available" | "away" | "busy" | "unknown";

export interface Clinic {
  id: string;
  name: string;
  fee?: Fee;
  address: string;
  contact: string;
  dayTime: string[];
  whatsApp?: string;
  facilities?: string[];
  parkingAvailable?: boolean;
  location?: Record<string, number>;
  wheelchairAccessible?: boolean;
  schedule?: Record<string, { start: string; end: string; type?: string }[]>;
}

export type DoctorActions = {
  call: () => void;
  schedule: (targetElement: EventTarget & Element) => void;
  message: () => void;
  profile: () => void;
  book: () => void;
};

export interface DrCTA {
  icon: string;
  name: keyof DoctorActions;
  label: string;
  needsDD?: boolean;
  action: () => void;
  isPrimary?: boolean;
}

export interface Doc {
  id: string;
  fee: Fee;
  name: string;
  status?: Status;
  rating?: number;
  reviews?: number;
  contact?: string;
  clinics: Clinic[];
  verified: boolean;
  lastUpdated?: number;
  onlineConsult: boolean;
  bookingEnabled: boolean;
  avgConsultTime?: number;
  queuedPatients?: number;
  primarySpecialization: string;
  secondarySpecializations: string[];
  credentials: string;
  experience?: number | null;
  nextAvailable?: string | null;
  currentlyAvailable: boolean;
  waitingTime?: string;
  office?: Record<string, string>;
}
