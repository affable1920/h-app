import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import z from "zod";
import type { Filters } from "@/types/pagination";

export type FilterKey = keyof Filters;

export const EMPTY_FILTERS: Filters = {
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

function seedFromParams(searchParams: URLSearchParams): Filters {
  function getNumberParam(key: FilterKey) {
    return searchParams.get(key) ? Number(searchParams.get(key)) : null;
  }

  const sortOrderParam = searchParams.get("sortOrder") ?? undefined;
  const sortOrder: Filters["sortOrder"] =
    sortOrderParam === "asc" || sortOrderParam === "desc"
      ? sortOrderParam
      : undefined;

  return {
    specialization: searchParams.get("specialization"),
    minRating: getNumberParam("minRating"),
    currentlyAvailable:
      searchParams.get("currentlyAvailable") === "1" ? "1" : null,
    gender: (searchParams.get("gender") as Filters["gender"]) ?? null,
    experience: getNumberParam("experience"),
    fee: getNumberParam("fee"),
    sortColumn: searchParams.get("sortColumn"),
    sortOrder,
    verified: searchParams.get("verified") === "1" ? "1" : null,
  };
}

export function useFilterStore() {
  const [searchParams] = useSearchParams();

  const form = useForm<Filters>({
    defaultValues: seedFromParams(searchParams),
    resolver: zodResolver(schema),
  });

  return form;
}
