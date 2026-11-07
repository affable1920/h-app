import { safeParseNumber } from "@/utils/utils";

type FilterValue = string | null;

export type FilterDefinition = {
  key: string;
  parse: (raw: FilterValue) => unknown;
  countsAsActive?: boolean;
  resetsPageOnChange?: boolean;
};

export type DefinitionMap = Record<string, FilterDefinition>;

export const defaultDefinitions = {
  searchQuery: {
    key: "searchQuery" as const,
    parse: function (raw) {
      return raw !== null && raw.trim() !== "" ? raw : null;
    },
    resetsPageOnChange: true,
    countsAsActive: true,
  },

  page: {
    key: "page" as const,
    parse: safeParseNumber,
    countsAsActive: false,
    resetsPageOnChange: false,
  },

  sortOrder: {
    key: "sortOrder" as const,
    parse: function (raw) {
      return raw === "asc" || raw === "desc" ? raw : null;
    },
    countsAsActive: true,
    resetsPageOnChange: true,
  },

  sortColumn: {
    key: "sortColumn" as const,
    parse: function (raw) {
      return raw !== null && raw.trim() !== "" ? raw : null;
    },
    resetsPageOnChange: true,
    countsAsActive: true,
  },
} satisfies DefinitionMap;

export type DefaultDefinitionKey = keyof typeof defaultDefinitions;
export type DefaultDefinitionValues = {
  [K in keyof typeof defaultDefinitions]: ReturnType<
    (typeof defaultDefinitions)[K]["parse"]
  >;
};
export type PartialDefaultDefinitions = Partial<
  Record<DefaultDefinitionKey, FilterDefinition>
>;

export type IncludeDefaults = Partial<Record<DefaultDefinitionKey, true>>;

export type Parsed<D extends DefinitionMap> = {
  [K in keyof D]: ReturnType<D[K]["parse"]>;
};

export type IncludedDefaults<I extends IncludeDefaults> = {
  [K in keyof I & DefaultDefinitionKey as I[K] extends true
    ? K
    : never]: ReturnType<(typeof defaultDefinitions)[K]["parse"]>;
};
