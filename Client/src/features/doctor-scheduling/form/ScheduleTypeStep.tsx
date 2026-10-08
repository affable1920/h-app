import { useController, useFormContext } from "react-hook-form";
import Badge from "@components/ui/Badge";
import { Stack } from "@components/ui/Stack";
import { type ScheduleCreate } from "../contract/create-schema";
import { DateTime } from "luxon";

const TYPES = ["one-off", "weekly", "monthly"] as const;
type Recurrence = ScheduleCreate["recurrence"];
type RecurrenceKind = Recurrence["kind"];

function initialRecurrence(kind: RecurrenceKind): Recurrence {
  switch (kind) {
    case "one-off":
      return {
        kind: "one-off",
        date: "",
      };

    case "weekly":
      return {
        kind: "weekly",
        startsOn: DateTime.local().toISODate(),
        endsOn: null,
        interval: 1,
        weekdays: [],
      };

    case "monthly":
      return {
        kind: "monthly",
        startsOn: DateTime.local().toISODate(),
        endsOn: null,
        interval: 1,
        monthDays: [],
      };
  }
}

export function ScheduleTypeStep() {
  const form = useFormContext<ScheduleCreate>();

  const { field, fieldState } = useController({
    name: "recurrence.kind",
    control: form.control,
  });

  function selectKind(kind: RecurrenceKind) {
    if (form.getValues("recurrence.kind") === kind) {
      return;
    }

    form.setValue("recurrence", initialRecurrence(kind));
    form.clearErrors();
  }

  const initialKind = field.value ?? TYPES[0];

  return (
    <fieldset className="text-center">
      <legend className="mx-6 text-text-normal leading-tight font-semibold mb-4 space-y-1">
        Hey{" "}
        <strong>
          <em>DOC !</em>
        </strong>{" "}
        <br />
        <span className="font-normal">
          What kind of a schedule would you like to create .. ?
        </span>
      </legend>

      <Stack
        align="center"
        justify="center"
        gap={"sm"}
        style={{ flexWrap: "wrap", marginBottom: "4px" }}
      >
        {TYPES.map(function (frame) {
          return (
            <Badge
              as="label"
              key={frame}
              htmlFor={frame}
              selected={frame === field.value}
              data-tooltip={`Describes a ${frame} schedule`}
              className={`px-4 focus-within:ring-3 focus-within:ring-brand/20`}
            >
              <input
                onChange={function () {
                  selectKind(frame);
                }}
                className="sr-only"
                type="radio"
                id={frame}
                name={field.name}
                value={frame}
                checked={frame === field.value}
                data-modal-initial-focus={
                  frame === initialKind ? "" : undefined
                }
              />
              <span>{frame}</span>
            </Badge>
          );
        })}
      </Stack>

      {fieldState.error && (
        <span
          role="alert"
          className="text-red-400 first-letter:capitalize text-sm"
        >
          {fieldState.error?.message}
        </span>
      )}
    </fieldset>
  );
}
