import DirectoryFilter from "@/components/DirectoryFilter";
import ScheduleModal from "../../features/booking/components/ScheduleModal";
import Confirmation from "./Confirmation";
import SearchBar from "../ui/SearchBar";
import DrProfileSetup from "../../features/onboarding-doctor/DrProfileSetup";
import useModalStore, { removeModal } from "@/stores/modal-store";
import {
  useController,
  useForm,
  useWatch,
  type Control,
} from "react-hook-form";
import { type DoctorOnboarding } from "@/schemas";
import type { Doctor } from "@/types/http";
import SelectFilter from "../ui/SelectFilter";
import { useCallback, useRef } from "react";
import { type Weekday } from "@/types/utils";
import { WEEKDAYS } from "@/utils/constants";
import StepInput, { type StepHandle } from "../ui/StepInput";
import { Stack } from "../ui/Stack";
import Input from "../ui/Input";
import Switch from "../ui/Switch";
import Button from "../ui/Button";
import { CalendarPlus, SaveAll, X } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Badge from "../ui/Badge";
import { motion } from "motion/react";

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

const MODALS: Record<string, React.ElementType> = {
  schedule: ScheduleModal,
  search: SearchBar,

  confirmation: Confirmation,

  "create-schedule": function ({ doctor }: { doctor: Doctor }) {
    const draft = localStorage.getItem("created-schedule") ?? null;

    const form = useForm<CreateSchedule>({
      resolver: zodResolver(schema),
      defaultValues: draft
        ? (JSON.parse(draft) as unknown as Partial<CreateSchedule>)
        : {
            ...{
              weekdays: [],
              isActive: true,
              repeat: true,
              baseSlotDuration: 10,
            },
          },
      reValidateMode: "onChange",
      resetOptions: {
        keepDefaultValues: true,
      },
    });

    const ref = useRef<StepHandle>(null);
    const wkdays = form.watch("weekdays");
    const { errors } = form.formState;

    console.log(form.getValues());

    const updateSlotDuration = useCallback(function (operation: "up" | "down") {
      return function (val: number) {
        if (operation === "down") {
          ref.current?.stepDown(String(10));
          form.setValue(
            "baseSlotDuration",
            form.getValues("baseSlotDuration") - val,
          );
        } else {
          ref.current?.stepUp();
          form.setValue(
            "baseSlotDuration",
            form.getValues("baseSlotDuration") + val,
          );
        }
      };
    }, []);

    async function submit(data: CreateSchedule) {
      console.log(data);
    }

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
                      form.setValue("weekdays", [
                        ...wkdays.filter(function (wk) {
                          return wk !== wkd;
                        }),
                      ]);
                    } else {
                      form.setValue("weekdays", [...wkdays, wkd]);
                    }
                  }}
                  label={"weekdays"}
                  options={WEEKDAYS}
                />
              </Stack>
            </Stack>

            <Stack
              align="center"
              gap="md"
              justify="between"
              className="**:grow"
            >
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

            <StepInput
              step={5}
              ref={ref}
              max={60}
              min={10}
              defaultValue={form.formState.defaultValues?.baseSlotDuration}
              onChange={ref.current?.handleChange}
              onStepDown={updateSlotDuration("down")}
              onStepUp={updateSlotDuration("up")}
              label="base slot duration (Minutes)"
            />

            <Stack justify="center" orientation="V" gap="sm">
              <Stack align="center">
                <Switch label="repeat" toggle={function () {}} isOn={true} />

                <Stack>
                  <motion.p className="font-semibold first-letter:capitalize">
                    every
                  </motion.p>
                  <select className="bg-layout-raised p-1 px-2 capitalize rounded-md text-sm cursor-pointer">
                    {(["week", "month"] as const).map(function (frame) {
                      return (
                        <option key={frame} value={frame}>
                          {frame[0]?.toUpperCase() + frame.substring(1)}
                        </option>
                      );
                    })}
                  </select>
                </Stack>
              </Stack>
              <Switch label="set Active" isOn={true} toggle={function () {}} />
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
  },

  directoryFilter: DirectoryFilter,
  "doc-profile-setup": DrProfileSetup,
  picker: function ({
    control,
    name,
  }: {
    control: Control<DoctorOnboarding>;
    name: string;
  }) {
    const { field } = useController<DoctorOnboarding>({
      name: name as "primary_specialization",
      control,
    });

    const ps = useWatch<DoctorOnboarding>({
      name: name as "primary_specialization",
      control,
    });

    const { items = [] } = useModalStore((s) => s.modalProps) as {
      items: Array<string>;
    };

    if (!items) {
      return;
    }

    return (
      <article
        style={{
          padding: "24px",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 12,
          maxHeight: "300px",
          overflowY: "scroll",
          scrollBehavior: "smooth",
          scrollbarWidth: "none",
        }}
      >
        {((items as Array<string>) ?? []).map(function (item) {
          return (
            <label
              key={item}
              htmlFor={item}
              className={`grow cursor-pointer inline-flex px-2 py-1 text-center items-center
                        justify-center rounded-md text-xs h-10 shadow-md shadow-black/10
                        ${
                          item === ps
                            ? "bg-white text-layout-raised font-semibold"
                            : "bg-layout-raised text-text-normal"
                        }`}
            >
              <input
                type="radio"
                id={item}
                style={{ display: "none" }}
                onChange={field.onChange}
                checked={item === ps}
                value={item}
              />
              {item}
            </label>
          );
        })}
      </article>
    );
  },
};

export default MODALS;
