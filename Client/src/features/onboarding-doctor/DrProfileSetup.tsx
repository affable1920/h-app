import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { AnimatePresence, motion } from "motion/react";
import type { APIError } from "@/types/http";
import { toast } from "sonner";
import { STEPS } from "./onboarding-steps/hierarchy";
import { Navigation } from "@/components/ui/Navigation";
import { DoctorOnboardingSchema, type DoctorOnboarding } from "@/schemas";
import { useSignup } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";
import { Stack } from "@/components/ui/Stack";
import useModalStore from "@/stores/modal-store";

const FIELDS: Array<Array<keyof DoctorOnboarding>> = [
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
  const navigate = useNavigate();
  const signup = useSignup();
  const openModal = useModalStore((s) => s.openModal);

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");

  const StepComponent = STEPS[step]!;

  const form = useForm<DoctorOnboarding>({
    resolver: zodResolver(DoctorOnboardingSchema),
    defaultValues: {
      profile: null,
      secondary_focus_areas: [],
      experience: 0,
    },
    reValidateMode: "onChange",
  });

  const goBack = useCallback(
    function () {
      setDirection("prev");
      setStep(function (p) {
        return p - 1;
      });
    },
    [step],
  );

  const goForward = useCallback(
    async function () {
      const ok = !FIELDS[step] || (await form.trigger(FIELDS[step]));

      console.log(ok);
      console.log(form.formState.errors);

      if (!ok) {
        return;
      }

      setDirection("next");
      setStep(function (p) {
        return p + 1;
      });
    },
    [step],
  );

  async function onSubmit(formData: DoctorOnboarding) {
    const fd = new FormData();

    for (const [key, val] of Object.entries(formData)) {
      if (Array.isArray(val)) {
        val.forEach(function (v) {
          fd.append(key, String(v));
        });
      } else if ((val as unknown) instanceof File) {
        fd.append(key, val as unknown as File);
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
            openModal("confirmation", {
              tagline: "Complete your profile setup ..?",
              resolve() {
                navigate("/view/auth/me");
              },
              reject() {
                navigate("/view/idx");
              },
              autoClose: true,
              timeout: 5000,
            });
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
        shadow-sm shadow-black/30 rounded-sm"
        >
          <span className="inline-flex w-1.5 h-1.5 rounded-full bg-text-teritiary animate-pulse" />
          <h1 className="text-text-secondary">Doctor Onboarding</h1>
        </div>

        <Stack orientation="V" gap={2}>
          <h2
            className="text-lg text-text-normal capitalize
            font-semibold text-text-primary"
          >
            {StepComponent.title}
          </h2>
          <h2 className="text-md text-text-normal">{StepComponent.subtitle}</h2>
        </Stack>
      </header>

      <section>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormProvider {...form}>
            <AnimatePresence mode="wait">
              <motion.article
                style={{
                  willChange: "contents",
                  height: "360px",
                  overflowY: "scroll",
                  scrollbarWidth: "none",
                }}
                key={step}
                initial={false}
                exit={{ opacity: 0, x: direction === "next" ? -20 : 20 }}
                transition={{ duration: 0.15, ease: "easeInOut" }}
              >
                <StepComponent.Component />
              </motion.article>
            </AnimatePresence>
          </FormProvider>

          <Navigation
            stepCount={STEPS.length}
            currentStep={step}
            showPillUi
            navigateBack={goBack}
            navigateForward={goForward}
          />
        </form>
      </section>
    </section>
  );
}
