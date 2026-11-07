import * as constants from "@/utils/constants";
import { Stack } from "./ui/Stack";
import Ratings from "./Ratings";
import {
  CLINIC_SORT_COLUMNS,
  clinicFilterDefinitions,
} from "@/domain/querying/clinic-filters";
import { defaultDefinitions } from "@/domain/querying/shared";
import { useDraftFilters } from "@/stores/filter-store";
import { MultiSelect } from "./ui/MultiSelectApi";
import DirectoryFilter from "./DirectoryFilter";
import { BadgeGroup } from "./lib/button/BadgeGroup";
import Badge from "./ui/Badge";

const RATINGS = Array.from({ length: 3 }, (_, i) => ({
  value: i + 2,
  render: function ({ ...props }) {
    return (
      <Badge as="button" {...props}>
        <Ratings value={this.value} />
      </Badge>
    );
  },
}));

const definitions = {
  ...clinicFilterDefinitions,
  sortColumn: defaultDefinitions.sortColumn,
  sortOrder: defaultDefinitions.sortOrder,
};

export function ClinicFilterPanel() {
  const { draft, set, reset, apply, isDirty } = useDraftFilters(definitions);

  function clearSort() {
    reset("sortColumn");
    reset("sortOrder");
  }

  return (
    <DirectoryFilter
      setSortColumn={function (col) {
        const nxt = col === draft.sortColumn ? null : col;
        if (nxt === null) {
          clearSort();
          return;
        }

        set("sortColumn", nxt);
        if (!draft.sortOrder) {
          set("sortOrder", "asc");
        }
      }}
      setSortOrder={function (order: "asc" | "desc") {
        set("sortOrder", order);
      }}
      onReset={reset}
      onClearSort={clearSort}
      onApply={apply}
      sortColumns={CLINIC_SORT_COLUMNS}
      sortColumn={draft.sortColumn}
      sortOrder={draft.sortOrder}
      hasActiveFilters={Object.values(draft).some((v) => Boolean(v))}
      isDirty={isDirty}
    >
      <Stack orientation="V" gap={"md"}>
        <BadgeGroup
          grouplabel={
            <>
              filter by{" "}
              <em>
                <strong>rating</strong>
              </em>
            </>
          }
          onClick={function (next) {
            set("minRating", next);
          }}
          selected={draft.minRating}
          options={RATINGS}
        />

        <MultiSelect
          label="filter by specializations"
          options={constants.SPECIALIZATIONS.map((sp) => ({
            label: sp,
            value: sp,
          }))}
          onValueChange={function (next) {
            set("specializations", next);
          }}
          selected={draft.specializations ?? []}
        />

        <MultiSelect
          label="filter by facilities"
          options={constants.CLINIC_FACILITIES.map((f) => ({
            label: f,
            value: f,
          }))}
          onValueChange={function (next) {
            set("facilities", next);
          }}
          selected={draft.facilities ?? []}
        />
      </Stack>
    </DirectoryFilter>
  );
}
