import type { paths } from "@/types/api";

type QueryParams = paths["/doctors"]["get"]["parameters"]["query"];

export type Filters = NonNullable<QueryParams>;
export type CategoryFilters = Pick<Filters, "minRating" | "mode">;
