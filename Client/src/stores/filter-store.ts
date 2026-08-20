import type { ServerParams } from "@/types/http";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import z from "zod";

export type FilterState = Omit<
  NonNullable<ServerParams>,
  "max" | "page" | "searchQuery" | "maxDistance"
>;

export type FilterKey = keyof FilterState;

export const EMPTY_FILTERS: FilterState = {
  specialization: null,
  minRating: null,
  currentlyAvailable: null,
  verified: null,
  gender: null,
  experience: null,
  fee: null,
  sortColumn: null,
  sortOrder: undefined,
};

const schema = z.object({
  specialization: z.string().nullish(),
  minRating: z.number().min(2).max(5).nullish(),
  currentlyAvailable: z.enum(["1"]).nullish(),
  verified: z.enum(["1"]).nullish(),
  gender: z.enum(["male", "female"]).nullish(),
  experience: z.number().min(0).max(40).nullish(),
  fee: z.number().min(0).max(800).nullish(),
  sortColumn: z.string().nullish(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

function seedFromParams(searchParams: URLSearchParams): FilterState {
  function getNumberParam(key: FilterKey) {
    return !!searchParams.get(key) ? Number(searchParams.get(key)) : null;
  }

  const sortOrderParam = searchParams.get("sortOrder") ?? undefined;
  const sortOrder: FilterState["sortOrder"] =
    sortOrderParam === "asc" || sortOrderParam === "desc"
      ? sortOrderParam
      : undefined;

  return {
    specialization: searchParams.get("specialization"),
    minRating: getNumberParam("minRating"),
    currentlyAvailable:
      searchParams.get("currentlyAvailable") === "1" ? "1" : null,
    gender: (searchParams.get("gender") as FilterState["gender"]) ?? null,
    experience: getNumberParam("experience"),
    fee: getNumberParam("fee"),
    sortColumn: searchParams.get("sortColumn"),
    sortOrder,
    verified: searchParams.get("verified") === "1" ? "1" : null,
  };
}

export function useFilterStore() {
  const [searchParams] = useSearchParams();

  const form = useForm<FilterState>({
    defaultValues: seedFromParams(searchParams),
    resolver: zodResolver(schema),
  });

  return form;
}
