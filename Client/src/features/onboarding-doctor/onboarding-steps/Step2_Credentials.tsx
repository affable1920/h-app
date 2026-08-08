import Input from "@/components/ui/Input";
import { Stack } from "@/components/ui/Stack";
import type { DoctorOnboarding } from "@/schemas";
import { useFormContext } from "react-hook-form";

export function Step2_Credentials() {
  const form = useFormContext<DoctorOnboarding>();
  const { errors } = form.formState;

  return (
    <Stack orientation="V">
      <Input
        id="degree"
        label="degree"
        {...form.register("degree")}
        error={errors["degree"]}
        defaultValue={"MBBS"}
      />

      <Stack align="end" justify="between">
        <Input
          defaultValue={"Medical College Bla."}
          label="Medical College / University"
          {...form.register("medical_college")}
          error={errors["medical_college"]}
          id="medicalCollege"
        />
        <Input
          id="graduationYear"
          defaultValue={"2020"}
          label="graduation year"
          type="number"
          {...form.register("graduation_year", { valueAsNumber: true })}
          error={errors["graduation_year"]}
        />
      </Stack>

      <Stack align="end" justify="between">
        <Input
          id="licenseNumber"
          defaultValue={"Rlf-Mkr / 18029"}
          label="license Number"
          placeholder="MKR - 1703146/47"
          {...form.register("license_number")}
          error={errors["license_number"]}
        />
        <Input
          id="experience"
          label="experience (if any)"
          {...form.register("experience", {
            valueAsNumber: true,
            required: false,
          })}
          error={errors["experience"]}
          type="number"
        />
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
