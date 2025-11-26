export type DoctorActionSignature = (
  target?: EventTarget & HTMLButtonElement
) => void;

export type DrActionName = "call" | "schedule" | "message" | "profile";

export type DrCTA = {
  label: string;
  name: DrActionName;
  isPrimary?: boolean;
  showsModal?: boolean;
};
