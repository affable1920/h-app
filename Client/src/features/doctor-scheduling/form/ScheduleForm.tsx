import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import { ScheduleTypeStep } from "./ScheduleTypeStep";
import { useState } from "react";
import { Step2ScheduleVariant } from "./AvailabilityStep";
import { Step3_Slots } from "./SlotsPolicyStep";
import { Navigation } from "@/components/ui/Navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  useCreateSchedule,
  useDeleteSchedule,
} from "@/features/doctor-scheduling/api/mutations";
import type { APIError, Doctor } from "@/types/http";
import { toast } from "sonner";
import { removeModal } from "@/stores/modal-store";
import Button from "@/components/lib/button/Button";
import { useGetDoctorClinics } from "@/hooks/use-doctors";
import {
  type ScheduleCreate,
  ScheduleCreateSchema,
} from "../contract/create-schema";
import {
  getFirstErrorField,
  getSteps,
  getStepWithError,
  type ScheduleField,
  type ScheduleFormInput,
} from "./utils";
import { RecurrenceStep } from "./RecurrenceStep";
import { DateTime } from "luxon";

const VARIANTS = {
  center: {
    x: 0,
    opacity: 1,
  },
  exit(d: number) {
    return {
      x: d * -20,
      opacity: 0,
    };
  },
};

function ScheduleForm({ doctor }: { doctor: Doctor }) {
  const [dir, setDir] = useState<1 | -1>(1);
  const [step, setStep] = useState(0);

  /**
   * The three generic arguments describe form input, resolver context, and validated output.
   * The resolver performs parsing before your valid submit handler runs.
   */

  const form = useForm<ScheduleFormInput, unknown, ScheduleCreate>({
    resolver: zodResolver(ScheduleCreateSchema),

    defaultValues: {
      timezone: "Asia/Kolkata",
      baseSlotDuration: 10,
      maxSlots: null,
      isActive: true,
      allowOnlineConsultations: false,

      recurrence: {
        startsOn: DateTime.local().toISODate(),
      },
    },
  });

  const clinicsQuery = useGetDoctorClinics(undefined, {
    staleTime: 5 * 60 * 1000,
  });

  const { mutateAsync: create } = useCreateSchedule();
  const { mutate: deleteSchedule } = useDeleteSchedule();

  const recurrence = form.watch("recurrence.kind");

  const STEPS = [
    <ScheduleTypeStep key="type" />,
    <Step2ScheduleVariant
      clinics={clinicsQuery.data?.entities ?? []}
      isPending={clinicsQuery.isPending}
      isError={clinicsQuery.isError}
      key="variant"
    />,
    <Step3_Slots key="slots" />,
    ...(recurrence === "monthly" || recurrence === "weekly"
      ? [<RecurrenceStep key="recurrence" />]
      : []),
  ];

  async function navigateForward() {
    const toValidate = getSteps(form.getValues("recurrence.kind"))[
      step
    ] as Array<ScheduleField>;

    const okay = await form.trigger(toValidate, {
      shouldFocus: true,
    });

    if (!okay) {
      const firstErrorField = getFirstErrorField(form.formState.errors);
      form.setFocus(firstErrorField as ScheduleField);
      return;
    }

    setDir(1);
    setStep(function (p) {
      return p + 1;
    });
  }

  function navigateBack() {
    setDir(-1);
    setStep(function (p) {
      return p - 1;
    });
  }

  async function submit(data: ScheduleCreate) {
    console.log(data);

    try {
      const created = await create({
        doctorId: doctor.id,
        payload: data,
      });

      removeModal();
      toast.info("Your schedule was sucessfully created.", {
        action: (
          <Button
            onClick={function () {
              deleteSchedule(
                {
                  id: created.id,
                  doctorId: doctor.id,
                },
                {
                  onSuccess() {
                    toast.info("Schedule sucesfully removed.");
                  },
                },
              );
            }}
          >
            Undo
          </Button>
        ),
      });
    } catch (error) {
      const ex = error as APIError;
      toast.error(ex.code, {
        description() {
          return ex.message;
        },
      });
    }
  }

  function handleInvalidSubmit() {
    const firstErrorField = getFirstErrorField(
      form.formState.errors,
    ) as ScheduleField;

    if (firstErrorField) {
      const targetStep = getStepWithError(firstErrorField);

      setDir(step - targetStep < 0 ? -1 : 1);
      setStep(targetStep);

      form.setFocus(firstErrorField);
    }
  }

  const StepComponent = STEPS[step]!;

  return (
    <section className="p-6 px-8">
      <form onSubmit={form.handleSubmit(submit, handleInvalidSubmit)}>
        <FormProvider {...form}>
          <AnimatePresence mode="wait" custom={dir}>
            <motion.article
              style={{
                willChange: "contents",
              }}
              key={step}
              custom={dir}
              initial={false}
              animate="center"
              exit="exit"
              variants={VARIANTS}
              transition={{ duration: 0.15, ease: "easeInOut" }}
            >
              {StepComponent}
            </motion.article>
          </AnimatePresence>
        </FormProvider>

        <Navigation
          className="min-w-0 flex-1"
          showPillUi={true}
          currentStep={step}
          stepCount={STEPS.length}
          onBack={navigateBack}
          onForward={navigateForward}
          labelSubmitBtn="Publish schedule"
        />
      </form>
    </section>
  );
}

export default ScheduleForm;
