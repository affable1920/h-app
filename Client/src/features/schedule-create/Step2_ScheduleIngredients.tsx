import type { Weekday } from "@/types/utils";
import { WEEKDAYS } from "@/utils/constants";
import { X, Info } from "lucide-react";
import {
  Controller,
  useFormContext,
  type FieldValues,
  type Path,
} from "react-hook-form";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import SelectFilter from "../../components/ui/SelectFilter";
import { Stack } from "../../components/ui/Stack";
import { TimePicker } from "../../components/ui/TimePicker";
import type { ScheduleCreate } from "@/schemas";
import Badge from "../../components/ui/Badge";
import { Link } from "react-router-dom";

type DayOption = {
  value: number | Weekday;
  label: string;
};

function MultiSelect<T extends FieldValues>({
  fieldName,
  options,
}: {
  fieldName: Path<T>;
  options: Array<DayOption>;
}) {
  const { control, ...form } = useFormContext<T>();

  return (
    <Controller
      name={fieldName}
      control={control}
      render={function ({ field, fieldState }) {
        const selected: Array<string | number> = field.value ?? [];
        return (
          <Stack orientation="V">
            <Stack justify="between" align="center">
              {!!selected.length && (
                <Button
                  variant="icon"
                  size="sm"
                  onClick={function () {
                    form.reset(
                      { ...form.getValues(), [fieldName]: [] },
                      {
                        keepErrors: true,
                      },
                    );
                  }}
                  aria-label="unselect all"
                  data-tooltip="unselect all"
                  color="secondary"
                  bg={true}
                >
                  <X />
                </Button>
              )}
              {!!selected.length && (
                <Stack
                  className="-order-1"
                  align="center"
                  style={{ flexWrap: "wrap" }}
                >
                  {selected.map(function (sel) {
                    return (
                      <Badge
                        onClick={function () {
                          field.onChange(
                            selected.filter(function (s) {
                              return s !== sel;
                            }),
                          );
                        }}
                        selected
                        full={false}
                        key={sel}
                      >
                        {sel}
                      </Badge>
                    );
                  })}
                </Stack>
              )}
            </Stack>
            <Stack align="center">
              <Info size={13} />{" "}
              <p className="text-[10px] leading-tight">
                Weekdays of the schedule that have a common schedule time
                window.{" "}
                <Link
                  to=""
                  aria-disabled={"true"}
                  className="text-blue-500 hover:underline underline-offset-2 hover:text-blue-600 ml-1"
                >
                  Know more
                </Link>
              </p>
            </Stack>
            <Stack orientation="V">
              {fieldState.error && (
                <div className="text-red-400 text-sm px-1 text-center first-letter:capitalize">
                  {fieldState.error?.message}
                </div>
              )}
              <SelectFilter
                canSelectAll={true}
                onOptionSelect={function (option) {
                  if (option === "all") {
                    field.onChange(options.map((opt) => opt.value));
                    return;
                  }

                  field.onChange(
                    selected.includes(option.value)
                      ? selected.filter(function (s) {
                          return s !== option.value;
                        })
                      : [...selected, option.value],
                  );
                }}
                label={fieldName}
                options={options}
              />
            </Stack>
          </Stack>
        );
      }}
    />
  );
}

export function Step2A() {
  const form = useFormContext<ScheduleCreate>();

  const frame = form.watch("every");
  const { errors } = form.formState;

  const multiOptions =
    frame === "week"
      ? WEEKDAYS.map(function (wkd, idx) {
          return {
            label: wkd,
            value: idx + 1,
          };
        })
      : Array.from({ length: 31 }, function (_, i) {
          return {
            label: String(i + 1),
            value: i + 1,
          };
        });

  return (
    <Stack orientation="V" gap="md">
      <MultiSelect
        fieldName={frame === "week" ? "weekdays" : "dates"}
        options={multiOptions}
      />

      <Stack align="start" gap="md" justify="between" className="**:grow">
        <Stack orientation="V" justify="start">
          <label htmlFor="start-time" className="form-label text-sm px-1">
            Start time
          </label>
          <Controller
            name="startTime"
            control={form.control}
            render={function ({ field, fieldState }) {
              return (
                <>
                  <TimePicker
                    selected={field.value}
                    onChange={field.onChange}
                  />
                  {fieldState.error && (
                    <span
                      role="alert"
                      className="text-red-400 text-sm px-1 capitalize"
                    >
                      {fieldState.error.message}
                    </span>
                  )}
                </>
              );
            }}
          />
        </Stack>

        <Stack orientation="V" justify="start">
          <label htmlFor="start-time" className="form-label text-sm px-1">
            end time
          </label>
          <Controller
            name="endTime"
            control={form.control}
            render={function ({ field, fieldState }) {
              return (
                <>
                  <TimePicker
                    selected={field.value}
                    onChange={field.onChange}
                  />
                  {fieldState.error && (
                    <span
                      role="alert"
                      className="text-red-400 text-sm px-1 capitalize"
                    >
                      {fieldState.error.message}
                    </span>
                  )}
                </>
              );
            }}
          />
        </Stack>
      </Stack>

      <Input
        {...form.register("location")}
        id="location"
        label="location"
        error={errors?.["location"]}
      />
    </Stack>
  );
}
