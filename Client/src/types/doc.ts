type Fee = Record<string, string | number | null>;
export type Status = "available" | "away" | "busy" | "unknown";

export interface Clinic {
  name: string;
  fee?: Fee;
  address: string;
  contact: string;
  dayTime: string[];
  whatsApp?: string;
  location?: Record<string, number>;
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
