import type { operations } from "./api";

export type ServerParams = NonNullable<
  operations["get_doctors"]["parameters"]["query"]
>;

export type Filters = Omit<
  NonNullable<ServerParams>,
  "max" | "page" | "searchQuery" | "maxDistance"
>;
