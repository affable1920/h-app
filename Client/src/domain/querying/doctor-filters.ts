import { parseNumber, parseSwitch } from "@/utils/utils";
import type { DefinitionMap } from "./shared";

export const doctorFilterDefinitions = {
  currentlyAvailable: {
    key: "currentlyAvailable",
    parse: parseSwitch,
    countsAsActive: true,
    resetsPageOnChange: true,
  },
  verified: {
    key: "verified",
    parse: parseSwitch,
    countsAsActive: true,
    resetsPageOnChange: true,
  },
  minRating: {
    key: "minRating",
    parse(raw) {
      return parseNumber(raw);
    },
    countsAsActive: true,
    resetsPageOnChange: true,
  },
  experience: {
    key: "experience",
    parse: function (raw) {
      return parseNumber(raw);
    },
    countsAsActive: true,
    resetsPageOnChange: true,
  },
  fee: {
    key: "fee",
    parse: function (raw) {
      return parseNumber(raw);
    },
    countsAsActive: true,
    resetsPageOnChange: true,
  },
  specialization: {
    key: "specialization",
    parse: function (raw) {
      return raw !== null && raw !== "" ? raw : null;
    },
    countsAsActive: true,
    resetsPageOnChange: true,
  },
  gender: {
    key: "gender",
    parse: function (raw) {
      if (raw === "male" || raw === "female") {
        return raw;
      } else {
        return null;
      }
    },
    countsAsActive: true,
    resetsPageOnChange: true,
  },
} satisfies DefinitionMap;

export const DR_SORT_COLUMNS = [
  "name",
  "rating",
  "reviews",
  "experience",
  "fee",
] as const;
