import * as constants from "@/utils/constants";
import { Stack } from "./ui/Stack";
import Ratings from "./Ratings";
import { Mars, ShieldCheck, Venus } from "lucide-react";
import { Select } from "./ui/SelectApi";
import StepInput from "./ui/StepInput";
import { useDraftFilters } from "@/stores/filter-store";
import {
  doctorFilterDefinitions,
  DR_SORT_COLUMNS,
} from "@/domain/querying/doctor-filters";
import { defaultDefinitions } from "@/domain/querying/shared";
import DirectoryFilter from "./DirectoryFilter";
import { BadgeGroup } from "./lib/button/BadgeGroup";
import Badge from "./ui/Badge";

const labelStyle = "text-text-normal capitalize text-center";

const GENDERS = [
  {
    value: "male" as const,
    render: ({ ...props }) => (
      <Badge as="button" {...props}>
        Male <Mars size={12} />
      </Badge>
    ),
  },
  {
    value: "female" as const,
    render: ({ ...props }) => (
      <Badge as="button" {...props}>
        Female <Venus size={12} />
      </Badge>
    ),
  },
];

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
  ...doctorFilterDefinitions,
  sortColumn: defaultDefinitions.sortColumn,
  sortOrder: defaultDefinitions.sortOrder,
};

export function DoctorFilterPanel() {
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
      sortColumns={DR_SORT_COLUMNS}
      sortColumn={draft.sortColumn}
      sortOrder={draft.sortOrder}
      hasActiveFilters={Object.values(draft).some((v) => Boolean(v))}
      isDirty={isDirty}
    >
      <Stack orientation="V" gap={"md"}>
        <Select
          label="filter by specialization"
          options={constants.SPECIALIZATIONS.map((sp) => ({
            label: sp,
            value: sp,
          }))}
          onValueChange={function (option) {
            set("specialization", option as string);
          }}
          selected={draft.specialization}
        />

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

        <Stack orientation="V">
          <Stack justify="center" gap={4} align="center">
            <p className={labelStyle}>Verfication</p>
            <ShieldCheck size={13} color="teal" />
          </Stack>
          <Badge
            selected={draft.verified === "1"}
            aria-pressed={draft.verified === "1"}
            className={`font-semibold`}
            onClick={function () {
              set("verified", draft.verified === "1" ? null : "1");
            }}
            as="button"
          >
            Verified Doctors only
          </Badge>
        </Stack>

        <BadgeGroup
          selected={draft.gender}
          onClick={function (next) {
            set("gender", next);
          }}
          options={GENDERS}
          grouplabel={"Gender"}
        />

        <StepInput
          label="min experience (years)"
          id="experience"
          placeholder="-"
          max={40}
          step={1}
          onChange={function (e) {
            const val = typeof e === "string" ? null : e;
            set("experience", val);
          }}
          value={draft.experience ?? ""}
        />

        <StepInput
          label="max fee"
          id="fee"
          placeholder="-"
          max={800}
          step={50}
          onChange={function (e) {
            const val = typeof e === "string" ? null : e;
            set("fee", val);
          }}
          value={draft.fee ?? ""}
        />
      </Stack>
    </DirectoryFilter>
  );
}
