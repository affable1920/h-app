import InputElement, { Input } from "@/components/ui/Input";
import { Stack } from "@/components/ui/Stack";
import type { DoctorOnboarding } from "@/schemas";
import { useFormContext } from "react-hook-form";

export function Step2_Credentials() {
  const form = useFormContext<DoctorOnboarding>();
  const { errors } = form.formState;

  console.log(errors);

  return (
    <Stack orientation="V" gap={"sm"}>
      <Input.Group error={errors["degree"]?.message}>
        <Input.Label htmlFor="degree">degree</Input.Label>
        <Input.Element {...form.register("degree")} id="degree" />
      </Input.Group>

      <Stack align="start" gap="sm" justify="between">
        <Input.Group error={errors["medical_college"]?.message}>
          <Input.Label htmlFor="medical_college">medical_college</Input.Label>
          <Input.Element
            {...form.register("medical_college")}
            id="medical_college"
          />
        </Input.Group>

        <Input.Group error={errors["graduation_year"]?.message}>
          <Input.Label htmlFor="graduation_year">graduation_year</Input.Label>
          <Input.Element
            {...form.register("graduation_year", {
              valueAsNumber: true,
            })}
            type="number"
            inputMode="numeric"
            id="graduation_year"
          />
        </Input.Group>
      </Stack>

      <Stack align="start" gap="sm" justify="between">
        <Input.Group error={errors["license_number"]?.message}>
          <Input.Label htmlFor="licenseNumber">license number</Input.Label>
          <InputElement
            id="licenseNumber"
            defaultValue={"Rlf-Mkr / 18029"}
            placeholder="MKR - 1703146/47"
            {...form.register("license_number")}
          />
        </Input.Group>

        <Input.Group error={errors["experience"]?.message}>
          <Input.Label required={false} htmlFor="experience">
            Experience
          </Input.Label>
          <InputElement
            id="experience"
            defaultValue={"Rlf-Mkr / 18029"}
            placeholder="MKR - 1703146/47"
            {...form.register("experience", {
              valueAsNumber: true,
            })}
          />
        </Input.Group>
      </Stack>

      <div
        style={{
          padding: "14px 16px",
          marginTop: "4px",
          background: "var(--color-layout-raised)",
          borderRadius: 12,
          borderLeft: `3px solid var(--color-brand)`,
        }}
      >
        <div className="text-[12px] mb-1.5 flex items-center gap-1 text-sky-600 font-bold">
          <span>🔒</span> Verification notice
        </div>

        <div
          style={{
            fontSize: 11,
            lineHeight: 1.25,
            color: "var(--color-white)",
          }}
        >
          Your credentials will be verified against the Medical Council
          registry. This usually takes 1–2 business days.
        </div>
      </div>
    </Stack>
  );
}
