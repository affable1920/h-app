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
