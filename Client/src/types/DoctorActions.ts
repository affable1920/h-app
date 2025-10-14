export type DoctorActions = {
  call: () => void;
  schedule: (targetElement: EventTarget & Element) => void;
  message: () => void;
  profile: () => void;
  book: () => void;
};

export interface DrCTA {
  icon: string;
  label: string;
  needsDD?: boolean;
  isPrimary?: boolean;
  name: keyof DoctorActions;
}
