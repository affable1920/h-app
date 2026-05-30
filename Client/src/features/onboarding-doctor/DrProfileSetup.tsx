import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { AnimatePresence, motion } from "motion/react";
import type { APIError } from "@/types/http";
import { toast } from "sonner";
import { STEPS } from "./steps";
import { Navigation } from "@/components/ui/Navigation";
import { type DoctorCreate } from "@/types/http";
import { DrCreateSchema } from "@/schemas";
import { useSignup } from "@/hooks/auth";
import { useNavigate } from "react-router-dom";

const FIELDS: Array<Array<keyof DoctorCreate>> = [
  ["profile", "name", "gender"] as const,
  [
    "degree",
    "medical_college",
    "graduation_year",
    "license_number",
    "experience",
  ] as const,
  ["primary_specialization", "secondary_focus_areas", "bio"] as const,
  ["email", "password", "phone"] as const,
];

export default function DrProfileSetup() {
  const form = useForm<DoctorCreate>({
    resolver: zodResolver(DrCreateSchema),
    defaultValues: {
      profile: null,
      secondary_focus_areas: [],
      experience: 0,
    },
  });

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const StepComponent = STEPS[step]!;

  const navigate = useNavigate();

  const goBack = useCallback(
    function () {
      setStep((p) => p - 1);
    },
    [step],
  );

  const signup = useSignup();

  const goForward = useCallback(
    async function () {
      const ok = !FIELDS[step] || (await form.trigger(FIELDS[step]));

      if (!ok) {
        return;
      }

      setDirection("next");
      setStep((p) => p + 1);
    },
    [step],
  );

  async function onSubmit(formData: DoctorCreate) {
    const fd = new FormData();

    for (const [key, val] of Object.entries(formData)) {
      if (Array.isArray(val)) {
        val.forEach((v) => fd.append(key, String(v)));
      } else if ((val as any) instanceof File) {
        fd.append(key, val as any as File);
      } else if (val != null) {
        fd.append(key, String(val));
      }
    }

    try {
      signup.mutateAsync(
        {
          route: "doctor",
          data: fd,
          params: {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          },
        },
        {
          onError(error) {
            toast.message((error as unknown as APIError).msg);
          },
          onSuccess() {
            toast.message("Doctor profile created successfully!");
            navigate("/main/idx/doctors");
          },
        },
      );
    } catch (exc) {
      const { msg } = exc as APIError;
      toast.message(msg);
    }
  }

  return (
    <section>
      <header className="mb-8 flex flex-col gap-2">
        <div
          className="uppercase flex items-center gap-2 bg-layout-raised text-xs w-fit p-2 py-1.5 
        shadow-sm shadow-black/20 rounded-sm"
        >
          <span className="inline-flex w-2 h-2 rounded-full bg-text-teritiary animate-pulse" />
          <h1 className="text-text-secondary">Doctor Onboarding</h1>
        </div>

        <div className="gap-1">
          <h2 className="text-lg text-text-normal">{StepComponent.title}</h2>
          <h2 className="text-md text-text-normal">{StepComponent.subtitle}</h2>
        </div>
      </header>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormProvider {...form}>
          <AnimatePresence mode="wait">
            <motion.article
              layout
              style={{
                willChange: "contents",
              }}
              key={step}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction === "next" ? -20 : 20 }}
              transition={{ duration: 0.15, ease: "easeInOut" }}
            >
              <StepComponent.Component />
            </motion.article>
          </AnimatePresence>
        </FormProvider>
        <Navigation
          stepCount={STEPS.length}
          navigateForward={goForward}
          navigateBack={goBack}
          currentStep={step}
          showPillUi
        />
      </form>
    </section>
  );
}
