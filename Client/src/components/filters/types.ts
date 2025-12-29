import type { paths } from "@/types/api";

export type DrQueryFilters = Omit<
  NonNullable<paths["/doctors"]["get"]["parameters"]["query"]>,
  "page" | "max"
>;

export type CategoryFilters = Pick<DrQueryFilters, "minRating">;
