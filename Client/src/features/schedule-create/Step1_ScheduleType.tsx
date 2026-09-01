import { useController, useFormContext } from "react-hook-form";
import Badge from "../../components/ui/Badge";
import Code from "../../components/ui/Code";
import { Stack } from "../../components/ui/Stack";
import { type ScheduleCreate } from "@/schemas";

export function Step1_ScheduleType() {
  const form = useFormContext<ScheduleCreate>();

  const { field, fieldState } = useController({
    name: "every",
    control: form.control,
  });

  return (
    <div>
      <header className="text-center">
        <h2>
          Hey{" "}
          <Code
            className="capitalize bg-layout-raised! py-0.5! shadow-sm 
          border-2 border-border-strong"
          >
            doc
          </Code>
          ! <br />
          What's your schedule look like ?
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
        <p className="form-label text-sm font-semibold">Repeats every</p>

        <Stack align="center" gap={"sm"}>
          {["week", "month"].map(function (frame) {
            return (
              <label key={frame} htmlFor={frame}>
                <Badge
                  selected={frame === field.value}
                  onClick={function () {
                    field.onChange(frame);
                    form.clearErrors("every");
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
