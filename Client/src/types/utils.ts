import type { WEEKDAYS } from "@/utils/constants";
import type { ElementType } from "react";
import type { ServerParams } from "./http";

export type Position = { x: number; y: number };

export type Weekday = (typeof WEEKDAYS)[number];

export type MobileNavItem = {
  label: string;
  icon: ElementType;
  onClick?: () => void;
  route?: string;
  children?: Array<MobileNavItem>;
};

export type DrRouteFilters = Omit<
  NonNullable<ServerParams>,
  "max" | "page" | "searchQuery" | "maxDistance"
>;

export const FILTER_KEYS: Array<keyof DrRouteFilters> = [
  "specialization",
  "minRating",
  "currentlyAvailable",
  "verified",
  "gender",
  "experience",
  "fee",
  "sortColumn",
  "sortOrder",
] as const;
