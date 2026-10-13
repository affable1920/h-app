import type { ElementType } from "react";

export type MobileNavItem = {
  label: string;
  icon: ElementType;
  onclick?: () => void;
  children?: Array<MobileNavItem>;
};
