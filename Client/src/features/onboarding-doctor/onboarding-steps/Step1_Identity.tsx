import Input from "@/components/ui/Input";
import { Stack } from "@/components/ui/Stack";
import type { DoctorOnboarding } from "@/schemas";
import { useMemo, useEffect } from "react";
import { useFormContext } from "react-hook-form";

const accent = "#4f6ef7";

export function Step1_Identity() {
  const form = useFormContext<DoctorOnboarding>();
  const { errors } = form.formState;

  const fl = form.watch("profile") as unknown;

  const src = useMemo(
    function () {
      if (fl instanceof FileList && !!fl.length) {
        return URL.createObjectURL(fl.item(0) as File);
      }
      if (fl instanceof File) {
        return URL.createObjectURL(fl);
      } else {
        return null;
      }
    },
    [fl],
  );

  useEffect(
    function () {
      if (src) {
        return function () {
          URL.revokeObjectURL(src);
        };
      }
    },
    [src],
  );

  console.log(form.formState.errors["name"]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <Stack
        align="center"
        gap="md"
        className="p-5 rounded-xl bg-layout-raised"
      >
        <Stack
          justify="center"
          align="center"
          orientation="V"
          style={{
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              cursor: "pointer",
              overflow: "hidden",
              flexShrink: 0,
              fontSize: 28,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {src ? <img src={src} className="size-full object-cover" /> : "👨🏻‍⚕️"}
          </div>

          {errors["profile"] && (
            <div className="text-red-400 text-[10px]">
              {errors["profile"].message}
            </div>
          )}
        </Stack>

        <div>
          <div
            className="font-bold text-text-normal"
            style={{
              fontSize: 14,
            }}
          >
            Profile Photo
          </div>
          <div
            style={{
              color: "var(--color-text-teritiary)",
              fontSize: 12,
              marginBottom: 4,
              lineHeight: 1.25,
              fontWeight: 600,
            }}
          >
            A clear headshot works best.
            <br /> PNG or JPG, <strong>max 1 MB</strong>.
          </div>
          <label
            style={{
              display: "inline-flex",
              marginTop: 4,
              padding: "5px 14px",
              background: accent,
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Upload Photo
            <input
              {...form.register("profile")}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
            />
          </label>
        </div>
      </Stack>

      <Input
        {...form.register("name")}
        error={errors["name"]}
        label="name"
        id="name"
        size="sm"
      />

      <Stack gap="xs" orientation="V" className="px-1">
        <label htmlFor="gender" className="capitalize text-sm">
          Gender
        </label>
        {["male", "female"].map(function (gen) {
          return (
            <label
              key={gen}
              className="cursor-pointer capitalize inline-flex items-center gap-2 w-fit hover:text-text-normal"
            >
              <input type="radio" value={gen} {...form.register("gender")} />{" "}
              {gen}
            </label>
          );
        })}
        {errors["gender"] && (
          <div className="text-sm text-red-400">
            {errors["gender"]?.message}
          </div>
        )}
      </Stack>
    </div>
  );
}
