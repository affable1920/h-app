import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { readGivenFilters } from "@/domain/querying/filtering";
import { type DefinitionMap } from "@/domain/querying/shared";

export function useDraftFilters<D extends DefinitionMap>(defs: D) {
  const [params, setParams] = useSearchParams();
  const applied = readGivenFilters(params, defs);

  const [draft, setDraft] = useState(applied);

  function set<K extends keyof D>(key: K, value: (typeof draft)[K]) {
    setDraft(function (prev) {
      return { ...prev, [key]: value };
    });
  }

  const isDirty = Object.keys(draft).some(function (key) {
    return draft[key] !== applied[key];
  });

  function reset(key?: keyof typeof draft) {
    setDraft((p) =>
      key
        ? { ...p, [key]: null }
        : readGivenFilters(new URLSearchParams(), defs),
    );
  }

  function apply() {
    setParams(function (prev) {
      const next = new URLSearchParams(prev);

      for (const [name, def] of Object.entries(defs)) {
        const toParse = draft[name] === null ? null : String(draft[name]);
        const valid = def.parse(toParse);

        if (valid === null) {
          next.delete(def.key);
        } else {
          next.set(def.key, String(valid));
        }
      }

      next.delete("page");
      return next;
    });
  }

  return { draft, set, isDirty, reset, apply };
}
