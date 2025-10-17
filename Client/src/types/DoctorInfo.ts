import * as constants from "../utils/constants";

export type Consultation = "inPerson" | "online";

export type Fee = {
  [K in Consultation]?: number;
};

export type Location = {
  lat: number;
  lng: number;
};

export type Clinic = {
  id: string;
  name: string;
  address: string;
  contact: string;
  whatsapp?: string;
  location?: Location;
  facilities?: string[];
  parkingAvailable?: boolean;
};

export type TimeSlot = {
  begin: constants.Slot;
  booked: boolean;
  mode?: Consultation;
  duration: constants.ConsultationDuration;
};

export type Schedule = {
  clinic: Clinic;
  slots: TimeSlot[];
  end?: constants.Slot;
  start: constants.Slot;
  weekday: constants.Weekday;
  totalHoursAvailable?: number;
};
