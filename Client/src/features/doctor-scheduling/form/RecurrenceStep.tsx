import { Stack } from "@/components/ui/Stack";
import { Controller, useFormContext } from "react-hook-form";
import { type ScheduleCreate } from "@/features/doctor-scheduling/contract/create-schema";
import { Input } from "@/components/ui/Input";
import StepInput from "@/components/ui/StepInput";

export function RecurrenceStep() {
  const form = useFormContext<ScheduleCreate>();

  const recurrence = form.watch("recurrence");
  const kind = recurrence.kind;

  return (
    <Stack orientation="V" gap="md">
      <Stack align="start" justify="between">
        <Input.Group>
          <Input.Label required={false} htmlFor="recurrence.startsOn">
            starts on{" "}
            <em className="text-xs text-text-secondary">(optional)</em>
          </Input.Label>
          <Input.Element
            id="recurrence.startsOn"
            disabled={kind === "one-off"}
            defaultValue={kind === "one-off" ? recurrence.date : ""}
            type="date"
            size="xs"
            {...form.register("recurrence.startsOn")}
          />
        </Input.Group>
        <Input.Group>
          <Input.Label required={false} htmlFor="recurrence.endsOn">
            ends on <em className="text-xs text-text-secondary">(optional)</em>
          </Input.Label>
          <Input.Element
            id="recurrence.endsOn"
            disabled={kind === "one-off"}
            defaultValue={kind === "one-off" ? recurrence.date : ""}
            size="xs"
            type="date"
            {...form.register("recurrence.endsOn", {
              setValueAs(value) {
                return value === "" ? null : value;
              },
            })}
          />
        </Input.Group>
      </Stack>

      <Controller
        control={form.control}
        name="recurrence.interval"
        render={function ({ field, fieldState }) {
          return (
            <StepInput
              id="recurrence.interval"
              label={`Repeat every (${kind === "weekly" ? "week" : "month"})`}
              onChange={field.onChange}
              min={1}
              step={1}
              max={4}
              defaultValue={1}
              value={field.value}
              error={fieldState.error?.message}
            />
          );
        }}
      />
    </Stack>
  );
}
