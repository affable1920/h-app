import Input from "@/components/ui/Input";
import { useFormContext } from "react-hook-form";
import { type DoctorCreate } from "@/types/http";
import { SPECIALIZATIONS } from "@/utils/constants";
import { useEffect, useMemo } from "react";
import { Stack } from "@/components/ui/Stack";
import type z from "zod";
import { stepAuth } from "@/schemas";

const accent = "#4f6ef7";

export function Step1_Identity() {
  const form = useFormContext<DoctorCreate>();
  const { errors } = form.formState;

  const file = form.watch("profile") as unknown;

  const src = useMemo(
    function () {
      if (file instanceof FileList && file?.[0]) {
        return URL.createObjectURL(file[0]);
      }

      if (file instanceof File) {
        return URL.createObjectURL(file);
      } else {
        return null;
      }
    },
    [file],
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
          styles={{
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
            <div className="text-red-400 text-sm">
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
            <br /> PNG or JPG, <strong>max 5 MB</strong>.
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

export default function Step2_Credentials() {
  const form = useFormContext<DoctorCreate>();
  const { errors } = form.formState;

  return (
    <Stack orientation="V">
      <Input
        label="degree"
        {...form.register("degree")}
        error={errors["degree"]}
        defaultValue={"MBBS"}
      />

      <Stack align="center" justify="between">
        <Input
          defaultValue={"Medical College Bla."}
          label="Medical College / University"
          {...form.register("medical_college")}
          error={errors["medical_college"]}
        />
        <Input
          defaultValue={"2020"}
          label="graduation year"
          type="number"
          {...form.register("graduation_year", { valueAsNumber: true })}
          error={errors["graduation_year"]}
        />
      </Stack>

      <Stack align="center" justify="between">
        <Input
          defaultValue={"Rlf-Mkr / 18029"}
          label="license Number"
          placeholder="MKR - 1703146/47"
          {...form.register("license_number")}
          error={errors["license_number"]}
        />
        <Input
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

export function Step3_Craft() {
  const form = useFormContext<DoctorCreate>();
  const { errors } = form.formState;

  const ps = form.watch("primary_specialization");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <div className="flex flex-col gap-3">
        <label className="italic capitalize font-semibold px-1">
          Primary Specialization
        </label>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
          }}
        >
          {SPECIALIZATIONS.map((spec) => {
            return (
              <label
                key={spec}
                htmlFor={spec}
                className={`cursor-pointer inline-flex px-2 py-1 text-center items-center 
                justify-center rounded-md text-[10px] h-10 shadow-md shadow-black/25 
                ${
                  spec === ps
                    ? "bg-white text-layout-raised font-semibold"
                    : "bg-layout-raised text-text-normal"
                }`}
              >
                <input
                  type="radio"
                  id={spec}
                  value={spec}
                  style={{ display: "none" }}
                  {...form.register("primary_specialization")}
                />
                {spec}
              </label>
            );
          })}
        </div>

        <div className="italic text-sm text-red-600 px-1">
          {errors["primary_specialization"]?.message}
        </div>
      </div>

      <Input
        size="sm"
        label="Secondary areas of focus"
        defaultValue={"dermatology, cardiology"}
        {...form.register("secondary_focus_areas", { required: false })}
      />

      <div className="flex flex-col gap-2">
        <label className="italic font-semibold capitalize px-1">
          Professional Bio
        </label>
        <textarea
          style={{
            minHeight: 90,
            lineHeight: 1.3,
          }}
          className={`placeholder:italic italic border-2 border-border-vivid p-2
          rounded-md focus:ring-2 focus:ring-accent/25`}
          placeholder="Share your approach to patient care, what drives you, or any specialised training…"
        />
      </div>
    </div>
  );
}

export function Step4_Auth() {
  const form = useFormContext<z.infer<typeof stepAuth>>();
  const {
    formState: { errors },
  } = form;

  return (
    <Stack orientation="V" gap="md">
      <Input
        label="email"
        id="email"
        type="email"
        {...form.register("email")}
        error={errors["email"]}
      />
      <Input
        label="password"
        id="password"
        type="password"
        error={errors["password"]}
        {...form.register("password")}
      />
      <Input
        label="phone"
        id="phone"
        error={errors["phone"]}
        {...form.register("phone")}
      />
    </Stack>
  );
}

export const STEPS = [
  {
    tag: "STEP 01",
    title: "Let's start with you",
    subtitle: "The basics — who you are, and how the world sees you.",
    Component: Step1_Identity,
  },
  {
    tag: "STEP 02",
    title: "Your credentials",
    subtitle: "Tell us about the qualifications that define your expertise.",
    Component: Step2_Credentials,
  },
  {
    tag: "STEP 03",
    title: "Your craft",
    subtitle: "What do you specialise in, and how long have you been doing it?",
    Component: Step3_Craft,
  },
  {
    tag: "STEP 04",
    title: "Login Details",
    subtitle: "Access to you account.",
    Component: Step4_Auth,
  },
];
