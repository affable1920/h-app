import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import { Step1_ScheduleType } from "./Step1_ScheduleType";
import { useCallback, useEffect, useState } from "react";
import { Step2A } from "./Step2_ScheduleIngredients";
import { Step3_Slots } from "./Step3_Slots";
import { ScheduleCreateSchema, type ScheduleCreate } from "@/schemas";
import { Navigation } from "../../components/ui/Navigation";
import { AnimatePresence, motion } from "motion/react";
import { useCreateSchedule, useDeleteSchedule } from "@/hooks/use-schedules";
import type { APIError, Doctor } from "@/types/http";
import { toast } from "sonner";
import { removeModal } from "@/stores/modal-store";
import Button from "../../components/ui/Button";

type Frame = ScheduleCreate["every"];

const STEPS = [Step1_ScheduleType, Step2A, Step3_Slots];

function getSteps<T extends Frame>(frame: T): Array<string | Array<string>> {
  const commons = [
    "startTime",
    "endTime",
    "location",
    "baseSlotDuration",
    "setActive",
    "autoRepeat",
  ] as const;

  switch (frame) {
    case "week":
      return [
        "every",
        ["weekdays", ...commons.slice(0, 3)],
        [...commons.slice(3)],
      ];

    default:
      return [
        "every",
        ["dates", ...commons.slice(0, 3)],
        [...commons.slice(3)],
      ];
  }
}

// "week" -> weekdays, start, end times, slot duration, active, auto-repeat, location
// "month" -> dates, start, end times, slot duration, active, auto-repeat, location
// "custom" -> dates ...

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

function ScheduleCreater({ doctor }: { doctor: Doctor }) {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);

  const form = useForm({
    resolver: zodResolver(ScheduleCreateSchema),
    defaultValues: {
      baseSlotDuration: 10,
      setActive: true,
      autoRepeat: true,
      allowOnlineConsultations: false,
    },
    reValidateMode: "onChange",
  });

  const every = form.watch("every");

  useEffect(
    function () {
      if (!every) {
        return;
      }
      setDir(1);
      setStep(1);
    },
    [every],
  );

  const navigateForward = async function () {
    const ok = await form.trigger(
      getSteps(every)[step] as Array<keyof ScheduleCreate>,
      {
        shouldFocus: true,
      },
    );

    if (!ok) {
      return;
    }

    setDir(1);
    setStep(function (p) {
      return p + 1;
    });
  };

  const navigateBack = function () {
    setDir(-1);
    setStep(function (p) {
      return p - 1;
    });
  };

  const { mutateAsync: create } = useCreateSchedule();
  const { mutate: deleteSchedule } = useDeleteSchedule();

  async function submit(data: ScheduleCreate) {
    const created = await create(
      { doctorId: doctor.id, payload: data },
      {
        onSuccess() {
          removeModal();
          toast("Your schedule was sucessfully created.", {
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
        },
        onError(error) {
          const ex = error as APIError;
          toast.error(ex.type, {
            description() {
              return ex.msg;
            },
          });
        },
      },
    );
  }

  const StepComponent = STEPS[step]!;

  return (
    <section className="p-6 px-8">
      <form onSubmit={form.handleSubmit(submit)}>
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
              <StepComponent />
            </motion.article>
          </AnimatePresence>
        </FormProvider>

        <Navigation
          showPillUi={true}
          currentStep={step}
          stepCount={STEPS.length}
          navigateForward={navigateForward}
          navigateBack={navigateBack}
        />
      </form>
    </section>
  );
}

export default ScheduleCreater;
