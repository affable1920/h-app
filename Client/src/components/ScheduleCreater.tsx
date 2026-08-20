import { removeModal } from "@/stores/modal-store";
import type { Weekday } from "@/types/utils";
import { WEEKDAYS } from "@/utils/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, CalendarPlus, SaveAll } from "lucide-react";
import { motion } from "motion/react";
import { useForm, useController, Controller } from "react-hook-form";
import Button from "./ui/Button";
import { ControlledStepInput } from "./ui/ControlledStepInput";
import Input from "./ui/Input";
import SelectFilter from "./ui/SelectFilter";
import { Stack } from "./ui/Stack";
import Switch from "./ui/Switch";
import z from "zod";
import Badge from "./ui/Badge";

type CreateSchedule = {
  weekdays: Array<Weekday>;
  baseSlotDuration: number;
  repeat: boolean;
  isActive: boolean;
  location: string;
  startTime: string;
  endTime: string;
};

const schema = z.object({
  weekdays: z.array(z.enum(WEEKDAYS)).nonempty("Select at least one weekday"),
  baseSlotDuration: z.number().min(10, "Minimum duration is 10 minutes"),
  repeat: z.boolean(),
  isActive: z.boolean(),
  startTime: z
    .string("start time is required")
    .regex(/^\d{2}:\d{2}$/, "Invalid time format"),
  endTime: z
    .string("end time is required")
    .regex(/^\d{2}:\d{2}$/, "Invalid time format"),
  location: z
    .string("A valid location or a clinic name is required")
    .min(8, "A valid location or a clinic name is required"),
});

function ScheduleCreater() {
  const form = useForm<CreateSchedule>({
    resolver: zodResolver(schema),
    defaultValues: {
      weekdays: [],
      isActive: true,
      repeat: true,
      baseSlotDuration: 10,
    },
    reValidateMode: "onChange",
  });

  const wkdays = form.watch("weekdays");
  const { errors } = form.formState;

  async function submit(data: CreateSchedule) {
    console.log(data);
  }

  const { field: repeat } = useController({
    name: "repeat",
    control: form.control,
  });

  const { field: active } = useController({
    name: "isActive",
    control: form.control,
  });

  return (
    <section className="p-6 px-8 space-y-8">
      <form onSubmit={form.handleSubmit(submit)}>
        <Stack orientation="V" gap="md">
          <Stack orientation="V">
            {!!wkdays.length && (
              <Stack gap="sm" align="center">
                {wkdays.map(function (wkd) {
                  return (
                    <Badge
                      onClick={function () {
                        form.setValue("weekdays", [
                          ...wkdays.filter(function (wk) {
                            return wk !== wkd;
                          }),
                        ]);
                      }}
                      selected
                      full={false}
                      key={wkd}
                    >
                      {wkd}
                    </Badge>
                  );
                })}
              </Stack>
            )}

            <Stack orientation="V">
              {errors["weekdays"] && (
                <div className="text-red-400 text-sm px-1 text-center">
                  {errors["weekdays"].message}
                </div>
              )}
              <SelectFilter
                onOptionSelect={function (option) {
                  const wkd = option as Weekday;

                  if (wkdays.includes(wkd)) {
                    form.setValue(
                      "weekdays",
                      [
                        ...wkdays.filter(function (wk) {
                          return wk !== wkd;
                        }),
                      ],
                      {
                        shouldDirty: true,
                      },
                    );
                  } else {
                    form.setValue("weekdays", [...wkdays, wkd], {
                      shouldValidate: true,
                    });
                  }
                }}
                label={"weekdays"}
                options={WEEKDAYS}
              />
            </Stack>
          </Stack>

          <Stack align="center" gap="md" justify="between" className="**:grow">
            <Input
              {...form.register("startTime")}
              id="start time"
              label="start time"
              step="1800"
              type="time"
              error={errors?.["startTime"]}
            />
            <Input
              {...form.register("endTime")}
              id="end time"
              label="end time"
              type="time"
              step="1800"
              error={errors?.["endTime"]}
            />
          </Stack>

          <Controller
            name="baseSlotDuration"
            control={form.control}
            render={function ({ field: { onChange, ...field }, fieldState }) {
              return (
                <ControlledStepInput
                  onBlur={field.onBlur}
                  name={field.name}
                  label="base slot duration (minutes)"
                  id="base slot duration"
                  placeholder="-"
                  min="5"
                  max="60"
                  step="5"
                  value={field.value ?? ""}
                  onChange={function (e) {
                    form.clearErrors("baseSlotDuration");
                    onChange(e);
                  }}
                  onInvalid={function (msg = "-") {
                    onChange(null);
                    if (msg !== "-") {
                      form.setError(field.name, {
                        message: msg,
                      });
                    }
                  }}
                  error={fieldState.error?.message}
                />
              );
            }}
          />

          <Stack justify="center" orientation="V" gap="sm">
            <Stack align="center" gap="sm">
              <Switch
                label="repeat"
                toggle={function () {
                  repeat.onChange(!repeat.value);
                }}
                isOn={repeat.value}
              />

              {repeat.value && (
                <Stack align="center">
                  <motion.p className="font-semibold first-letter:capitalize">
                    every
                  </motion.p>
                  <select
                    className="bg-layout-raised p-1 px-2 capitalize rounded-md text-sm 
                  cursor-pointer"
                  >
                    {(["week", "month"] as const).map(function (frame) {
                      return (
                        <option key={frame} value={frame}>
                          {frame[0]?.toUpperCase() + frame.substring(1)}
                        </option>
                      );
                    })}
                  </select>
                </Stack>
              )}
            </Stack>
            <Switch
              label="set Active"
              isOn={active.value}
              toggle={function () {
                active.onChange(!active.value);
              }}
            />
          </Stack>

          <Input
            {...form.register("location")}
            label="location"
            type="text"
            id="location"
            error={errors?.["location"]}
          />
        </Stack>

        <Stack justify="between" className="mt-8">
          <Button onClick={removeModal} variant="ghost">
            Cancel <X />
          </Button>
          <Stack gap="sm">
            <Button type="submit" color="white">
              Create
              <CalendarPlus />
            </Button>
            <Button
              size="sm"
              onClick={function () {
                localStorage.setItem(
                  "created-schedule",
                  JSON.stringify(form.getValues()),
                );
                removeModal();
              }}
              data-tooltip="Save as draft"
              color="secondary"
              variant="icon"
              bg={true}
            >
              <SaveAll />
            </Button>
          </Stack>
        </Stack>
      </form>
    </section>
  );
}

export default ScheduleCreater;
