import type { CONSULTATION_DURATION } from "../utilities/constants";
import type { Fee, Status, Clinic, Schedule } from "./DoctorInfo";

export interface DoctorEssentials {
  id: string;
  name: string;
  email: string;

  credentials: string;
  primarySpecialization: string;
}

export interface DoctorSecondaryInfo {
  clinics: Clinic[];
  office: Partial<Clinic>;

  fee: Fee;
  schedule: Schedule;
  consultsOnline: boolean;
  experience?: number | null;
  contact?: string;
  status?: Status;
  rating?: number;
  reviews?: number;
  verified: boolean;
  lastUpdated?: number;
  secondarySpecializations?: string[];

  baseFee: number;
  baseConsultTime: (typeof CONSULTATION_DURATION)[number];

  waitingTime?: string;
  queuedPatients?: number;
  currentlyAvailable?: boolean;
  nextAvailable?: string | null;
}

export interface Doctor extends DoctorEssentials, DoctorSecondaryInfo {}
