import type { WEEKDAYS } from "@/utils/constants";

export type Position = { x: number; y: number };

export type Weekday = (typeof WEEKDAYS)[number];
