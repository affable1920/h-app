import type { ScheduleCreate } from "@/schemas";
import { useFormContext, Controller } from "react-hook-form";
import { ControlledStepInput } from "../../components/ui/ControlledStepInput";
import { Stack } from "../../components/ui/Stack";
import Switch from "../../components/ui/Switch";

export function Step3_Slots() {
  const form = useFormContext<ScheduleCreate>();

  return (
    <Stack orientation="V" justify="center" align="center" gap="md">
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

      <Controller
        name="maxSlots"
        control={form.control}
        render={function ({ field: { onChange, ...field }, fieldState }) {
          const value =
            typeof field.value == "number" ? String(field.value) : "";

          return (
            <ControlledStepInput
              onBlur={field.onBlur}
              name={field.name}
              label="Any Max slot limit"
              id="max slot limit"
              placeholder="-"
              min="1"
              step="1"
              value={value}
              onChange={function (e) {
                form.clearErrors("maxSlots");
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

      <Stack align="center" gap="sm">
        <Controller
          control={form.control}
          name="autoRepeat"
          render={function ({ field }) {
            return (
              <Switch
                label="auto-repeat"
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
          name="setActive"
          render={function ({ field }) {
            return (
              <Switch
                label="setActive"
                toggle={function () {
                  field.onChange(!field.value);
                }}
                isOn={field.value}
              />
            );
          }}
        />{" "}
      </Stack>

      <Stack>
        <Controller
          control={form.control}
          name="allowOnlineConsultations"
          render={function ({ field }) {
            return (
              <Switch
                label="allow online consultations"
                toggle={function () {
                  field.onChange(!field.value);
                }}
                isOn={field.value}
              />
            );
          }}
        />
      </Stack>
    </Stack>
  );
}
