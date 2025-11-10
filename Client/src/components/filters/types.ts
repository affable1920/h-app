import type { components } from "@/types/api";

export type Filters = components["schemas"]["RouteFilters"];
export type CategoryFilters = Pick<Filters, "rating" | "mode">;
