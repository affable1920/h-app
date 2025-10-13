import * as constants from "../utilities/constants";
import type { Fee, Clinic, Schedule } from "./DoctorInfo";

export interface DoctorEssentials {
  id: string;
  name: string;
  email: string;

  credentials: string;
  primarySpecialization: string;
}

export interface DoctorSecondaryInfo {
  fee: Fee;
  schedules: Schedule[];
  office: Partial<Clinic>;

  contact?: string;
  consultsOnline: boolean;
  experience?: number | null;

  rating?: number;
  reviews?: number;
  verified: boolean;
  status?: constants.Status;
  lastUpdated?: string | null;
  secondarySpecializations?: string[];

  baseFee: number;
  currentlyAvailable?: boolean;
  nextAvailable?: string | null;
  baseConsultTime: constants.ConsultationDuration;
}

export interface Doctor extends DoctorEssentials, DoctorSecondaryInfo {}
