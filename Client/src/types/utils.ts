import type { WEEKDAYS } from "@/utils/dataConstants";
import type { ElementType } from "react";

export type Position = { x: number; y: number };

export type Weekday = (typeof WEEKDAYS)[number];

export type MobileNavItem = {
  label: string;
  icon: ElementType;
  onClick?: () => void;
  children?: Array<MobileNavItem>;
};
