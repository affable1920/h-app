import { defaultDefinitions } from "./shared";
import type {
  DefaultDefinitionKey,
  FilterDefinition,
  PartialDefaultDefinitions,
  IncludeDefaults,
  DefinitionMap,
  IncludedDefaults,
  Parsed,
} from "./shared";

function getDefaultDefinition<K extends DefaultDefinitionKey>(key: K) {
  return defaultDefinitions[key];
}

function getDefaultDefinitions(
  defs: IncludeDefaults,
): PartialDefaultDefinitions {
  return Object.fromEntries(
    Object.entries(defs).map(function ([key]) {
      const defaultDefinition = getDefaultDefinition(
        key as DefaultDefinitionKey,
      );
      return [defaultDefinition.key, defaultDefinition];
    }),
  );
}

export function writeFilter(
  prev: URLSearchParams,
  filter: FilterDefinition | DefaultDefinitionKey,
  value: string | null,
): URLSearchParams {
  const next = new URLSearchParams(prev);
  const def =
    typeof filter === "string" ? getDefaultDefinition(filter) : filter;

  const valid = def.parse(value);

  if (valid === null) {
    next.delete(def.key);
  } else {
    next.set(def.key, String(valid));
  }

  if (def.resetsPageOnChange) {
    next.delete("page");
  }

  return next;
}

export function countActive(
  params: URLSearchParams,
  definitions: Record<string, FilterDefinition>,
  include: IncludeDefaults = {},
): number {
  const defaults = getDefaultDefinitions(include);

  return Object.values({ ...definitions, ...defaults }).reduce(
    (count, definition) => {
      if (!definition.countsAsActive) {
        return count;
      }

      const value = definition.parse(params.get(definition.key));
      return count + (value !== null ? 1 : 0);
    },
    0,
  );
}

export function readGivenFilters<
  const D extends DefinitionMap,
  const I extends IncludeDefaults,
>(
  params: URLSearchParams,
  filters: D,
  include: I = {} as I,
): Omit<IncludedDefaults<I>, keyof D> & Parsed<D> {
  // Read selected shared defaults and the supplied resource filters.
  // Object.fromEntries needs one localized result assertion here.

  const defaults = getDefaultDefinitions(include);

  return Object.fromEntries(
    Object.entries({ ...defaults, ...filters }).map(function ([
      name,
      { parse, key },
    ]) {
      return [name, parse(params.get(key))];
    }),
  ) as Parsed<D> & IncludedDefaults<I>;
}

export function readDefaults<I extends IncludeDefaults>(
  params: URLSearchParams,
  defs: I,
): IncludedDefaults<I> {
  return Object.fromEntries(
    Object.entries(defs).map(function ([name]) {
      const { key, parse } = getDefaultDefinition(name as DefaultDefinitionKey);
      return [key, parse(params.get(key))];
    }),
  ) as IncludedDefaults<I>;
}
