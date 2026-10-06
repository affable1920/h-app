import { useController, useFormContext } from "react-hook-form";
import Badge from "../../../components/ui/Badge";
import { Stack } from "../../../components/ui/Stack";
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

  return (
    <div>
      <header className="text-center space-y-1.5">
        <h2>Hey DOC !</h2>
        <h2 className="mx-6">
          What kind of a schedule would you like to create .. ?
        </h2>
      </header>

      <Stack
        style={{
          marginTop: "14px",
        }}
        orientation="V"
        gap={10}
        justify="center"
      >
        <Stack
          align="center"
          justify="center"
          gap={"sm"}
          style={{ flexWrap: "wrap" }}
        >
          {TYPES.map(function (frame) {
            return (
              <label key={frame} htmlFor={frame}>
                <Badge
                  selected={frame === field.value}
                  onClick={function () {
                    selectKind(frame);
                  }}
                  className={`px-4 ${frame === field.value ? "text-black" : "text-text-normal"}`}
                  full={false}
                >
                  {frame}
                  <input type="radio" id={frame} style={{ display: "none" }} />
                </Badge>
              </label>
            );
          })}
        </Stack>

        {fieldState.error && (
          <span role="alert" className="text-red-400 capitalize text-sm">
            {fieldState.error?.message}
          </span>
        )}
      </Stack>
    </div>
  );
}
