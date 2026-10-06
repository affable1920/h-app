import { useFormContext, Controller } from "react-hook-form";
import { Stack } from "@components/ui/Stack";
import { Switch } from "@components/ui/Switch";
import type { ScheduleCreate } from "@/features/doctor-scheduling/contract/create-schema";
import { AnimatePresence, motion } from "motion/react";
import StepInput from "@/components/ui/StepInput";

export function Step3_Slots() {
  const form = useFormContext<ScheduleCreate>();

  return (
    <Stack orientation="V" justify="center" align="center" gap="md">
      <Controller
        name="baseSlotDuration"
        control={form.control}
        render={function ({ field: { onChange, ...field }, fieldState }) {
          return (
            <StepInput
              onBlur={field.onBlur}
              name={field.name}
              label="Appointment duration (minutes)"
              id="base slot duration"
              placeholder="-"
              min={5}
              max={60}
              step={5}
              value={field.value ?? ""}
              onChange={function (e) {
                form.clearErrors("baseSlotDuration");
                onChange(e);
              }}
              error={fieldState.error?.message}
            />
          );
        }}
      />
      <Controller
        name="maxSlots"
        control={form.control}
        render={function ({ field: { onChange, ...field }, fieldState }) {
          const value =
            typeof field.value == "number" ? String(field.value) : "";

          return (
            <Stack orientation="V" justify="center">
              <Switch
                ref={field.ref}
                id="maxSlots"
                label="set max appointments per day"
                isOn={!!field.value}
                toggle={function () {
                  if (field.value === null) {
                    onChange(1);
                  } else {
                    onChange(null);
                  }
                }}
              />
              <AnimatePresence mode="sync">
                {!!field.value && (
                  <motion.span
                    initial={{ height: 0, marginBlock: 0 }}
                    animate={{
                      height: "auto",
                      marginBlock: "4px",
                      transition: { height: { type: "spring", bounce: 0.15 } },
                    }}
                    exit={{
                      height: 0,
                      marginBlock: 0,
                      transition: { type: "spring", bounce: 0, duration: 0.15 },
                    }}
                    style={{ display: "block" }}
                  >
                    <StepInput
                      step={1}
                      onBlur={field.onBlur}
                      name={field.name}
                      label="Max appointments"
                      id="max slot limit"
                      max={100}
                      min={1}
                      placeholder="-"
                      value={value}
                      onChange={function (e) {
                        form.clearErrors("maxSlots");
                        onChange(e);
                      }}
                      error={fieldState.error?.message}
                    />
                  </motion.span>
                )}
              </AnimatePresence>
            </Stack>
          );
        }}
      />

      <Controller
        control={form.control}
        name="allowOnlineConsultations"
        render={function ({ field }) {
          return (
            <Switch
              label="allow online consultations"
              id="allowOnlineConsultations"
              toggle={function () {
                field.onChange(!field.value);
              }}
              isOn={field.value}
            />
          );
        }}
      />
      <Controller
        control={form.control}
        name="isActive"
        render={function ({ field }) {
          return (
            <Switch
              id="isActive"
              label="Open for booking immediately"
              toggle={function () {
                field.onChange(!field.value);
              }}
              isOn={field.value}
            />
          );
        }}
      />
    </Stack>
  );
}
