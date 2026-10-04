import { WEEKDAYS } from "@/utils/constants";
import { Controller, useFormContext } from "react-hook-form";
import { Stack } from "../../../../components/ui/Stack";
import type { ScheduleCreate } from "@/features/schedule-create/schema";
import type { GetDoctorClinicsResponse } from "@/types/doctor-api";
import { Input } from "@/components/ui/Input";
import { Info } from "lucide-react";
import { Select } from "@/components/ui/SelectApi";
import { MultiSelect } from "@/components/ui/MultiSelectApi";

const WKDAYS = WEEKDAYS.map(function (wkd, idx) {
  return {
    label: wkd.slice(0, 3),
    value: idx + 1,
  };
});

const MONTH_DAYS = Array.from(
  {
    length: 31,
  },
  function (_, i) {
    const day = i + 1;
    return {
      label: String(day),
      value: day,
    };
  },
);

export function Step2ScheduleVariant({
  clinics,
}: {
  clinics: GetDoctorClinicsResponse["entities"];
  isPending: boolean;
  isError: boolean;
}) {
  const form = useFormContext<ScheduleCreate>();

  const recurrence = form.watch("recurrence.kind");
  const dateError = form.getFieldState("recurrence.date").error?.message;

  return (
    <Stack orientation="V" gap="md">
      {recurrence === "one-off" ? (
        <Input.Group error={dateError}>
          <Input.Label htmlFor="date">date</Input.Label>
          <Input.Element
            type="date"
            id="date"
            {...form.register("recurrence.date")}
            defaultValue={"10-01-2026"}
          />
        </Input.Group>
      ) : (
        <Controller
          name="recurrence.weekdays"
          control={form.control}
          render={function ({ field, fieldState }) {
            return (
              <Stack orientation="V">
                <Stack orientation="V">
                  <Stack align="center">
                    <Info size={10} />
                    <p className="text-sm">
                      {recurrence === "weekly" ? "Weekdays" : "Month days"} that
                      have a common schedule time window
                    </p>
                  </Stack>
                  {fieldState.error && (
                    <div className="text-red-400 text-sm px-1 text-center first-letter:capitalize">
                      {fieldState.error?.message}
                    </div>
                  )}

                  <MultiSelect
                    ref={(r) => field.ref(r)}
                    showSelectAll={true}
                    options={recurrence === "weekly" ? WKDAYS : MONTH_DAYS}
                    label={recurrence === "weekly" ? "Weekdays" : "Month days"}
                    selected={field.value}
                    onValueChange={function (next) {
                      field.onChange(next);
                    }}
                  />
                </Stack>
              </Stack>
            );
          }}
        />
      )}

      <Stack align="start" justify="between" className="**:flex-1" gap="md">
        <Input.Group error={form.formState.errors["startTime"]?.message}>
          <Input.Label htmlFor="startTime">start time</Input.Label>
          <Input.Element
            type="time"
            step={300}
            {...form.register("startTime")}
            defaultValue={"10:00"}
          />
        </Input.Group>

        <Input.Group error={form.formState.errors["endTime"]?.message}>
          <Input.Label htmlFor="endTime">end time</Input.Label>
          <Input.Element
            type="time"
            step={300}
            {...form.register("endTime")}
            defaultValue={"12:00"}
          />
        </Input.Group>
      </Stack>

      <Controller
        control={form.control}
        name="clinicId"
        render={function ({ field, fieldState }) {
          return (
            <Stack orientation="V">
              {fieldState.error && (
                <div className="text-red-400 text-sm px-1 text-center first-letter:capitalize">
                  {fieldState.error?.message}
                </div>
              )}
              <Select
                options={clinics.map((cl) => ({
                  label: cl.name,
                  value: cl.id,
                }))}
                label="Clinic"
                selected={field.value ?? null}
                onValueChange={field.onChange}
              />
            </Stack>
          );
        }}
      />
    </Stack>
  );
}
