import { parseNumber } from "@/utils/utils";
import type { DefinitionMap } from "./shared";

export const clinicFilterDefinitions = {
  specializations: {
    key: "specializations",
    parse: function (raw) {
      if (raw !== null && raw !== "") {
        return raw.split(",");
      }
      return null;
    },
    countsAsActive: true,
    resetsPageOnChange: true,
  },
  facilities: {
    key: "facilities",
    parse(raw) {
      if (raw !== null && raw !== "") {
        return raw.split(",");
      }
      return null;
    },
    countsAsActive: true,
    resetsPageOnChange: true,
  },
  minRating: {
    key: "minRating",
    parse: parseNumber,
    countsAsActive: true,
    resetsPageOnChange: true,
  },
} satisfies DefinitionMap;

export const CLINIC_SORT_COLUMNS = ["name", "rating", "reviews"] as const;
