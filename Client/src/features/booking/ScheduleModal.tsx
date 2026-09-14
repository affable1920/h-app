import Button from "@/components/ui/Button";
import type { APIError, Clinic, Doctor, Slot } from "@/types/http";
import {
  useCancelBooking,
  useCreateBooking,
} from "@/features/booking/use-booking";
import { toast } from "sonner";
import useModalStore from "@/stores/modal-store";
import useAuthStore from "@/stores/auth-store";
import { MapPinCheckInside } from "lucide-react";
import { fromISO } from "@/utils/utils";
import Badge from "@/components/ui/Badge";
import { Stack } from "@/components/ui/Stack";
import { useRef, useState, type SubmitEvent } from "react";
import { PatientSignin } from "@/components/PatientSignin";
import { PatientRegister } from "@/components/PatientRegister";

type ScheduleModalProps = {
  doctor: Doctor;
  slot: Slot;
  clinic: Clinic;
  onSuccess?: () => void;
};

function ScheduleModal({
  doctor,
  slot,
  clinic,
  onSuccess,
}: ScheduleModalProps) {
  const slotDatetimeISO = fromISO(slot.slot_datetime);
  const fullDate = slotDatetimeISO.toFormat("dd LLL yyyy -");

  const user = useAuthStore((s) => s.user);

  const closeModal = useModalStore((s) => s.closeModal);
  const reasonRef = useRef<HTMLTextAreaElement | null>(null);

  const { mutateAsync: book, isPending: bookingIsPending } = useCreateBooking();
  const { mutate: cancelBooking } = useCancelBooking();

  async function confirmSlot(ev: SubmitEvent<HTMLFormElement>) {
    ev.preventDefault();

    const formData = new FormData(ev.currentTarget);
    const reason = formData.get("reasonForVisit");

    if (!slot) {
      return;
    }

    const payload = {
      slotId: slot.id,
      date: slot.slot_datetime,
      doctorId: doctor.id,
      reasonForVisit:
        typeof reason === "string" && reason.trim() ? reason.trim() : undefined,
    };

    try {
      const model = await book(payload);

      toast.info("Slot booked sucessfully!", {
        duration: 4000,
        closeButton: true,
        action: {
          label: "Undo",
          onClick() {
            cancelBooking(
              {
                appointmentId: model.id,
                doctorId: doctor.id,
              },
              {
                onSuccess() {
                  toast.info("Your slot was sucessfully cancelled!");
                },
                onError() {
                  toast.info("Your slot could not be cancelled!", {
                    description: "Please try after sometime.",
                  });
                },
              },
            );
          },
        },
      });

      onSuccess?.();
    } catch (exc) {
      const ex = exc as unknown as APIError;
      toast.error(ex.code, {
        description: ex.message,
      });
    }
  }

  const [mode, setMode] = useState<"login" | "register">("login");

  function showAuthForm() {
    return mode === "login" ? <PatientSignin /> : <PatientRegister />;
  }

  return (
    <section className="p-6">
      <header
        className="bg-layout-raised p-3 rounded-md space-y-6 shadow-md shadow-black/10 
        border border-border"
      >
        <Stack justify="between" align="start">
          <div className="space-y-1">
            <h3 className="text-text text-md">Dr. {doctor.name}</h3>
            <h3 className="text-xs">( {doctor.primarySpecialization} )</h3>
          </div>
        </Stack>

        <Stack orientation="V" gap={2} justify="end">
          <Stack className="min-w-0 shrink" align="center">
            <h2 className="text-sm text-text-secondary">{clinic?.name}</h2>

            <Button variant="icon" data-tooltip="Get exact location !">
              <MapPinCheckInside />
            </Button>
          </Stack>

          <Stack className="text-sm font-semibold">
            {fullDate && <span className="font-semibold">{fullDate}</span>}
            <span>{slotDatetimeISO.weekdayShort}</span> -
            <span>{slotDatetimeISO.toISOTime()?.split("+")[1]}</span>
          </Stack>
        </Stack>
      </header>

      <section className="mt-6">
        {user ? (
          <form onSubmit={confirmSlot}>
            <Stack orientation="V" gap="md">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="reasonForVisit"
                  className="capitalize px-1 text-text inline-flex items-center m-0 gap-1"
                >
                  What brings you in?
                  <strong className="text-xs text-text-normal italic font-normal">
                    (optional)
                  </strong>
                </label>
                <textarea
                  ref={reasonRef}
                  maxLength={1000}
                  aria-multiline="true"
                  spellCheck="false"
                  style={{
                    minHeight: 80,
                    lineHeight: 1.4,
                  }}
                  id="reasonForVisit"
                  name="reasonForVisit"
                  className={`placeholder:italic border border-border-vivid p-2
          rounded-md focus:ring-1 focus:ring-brand/20 placeholder:text-sm focus:ring-offset-2 
          focus:ring-offset-brand/10 outline-none text-sm`}
                />
              </div>
              <Stack orientation="V" gap={12}>
                <Stack align="center" justify="between">
                  <Button type="button" onClick={closeModal}>
                    cancel
                  </Button>

                  <Button
                    type="submit"
                    color="white"
                    loading={bookingIsPending}
                  >
                    Book
                  </Button>
                </Stack>

                <Badge disabled={bookingIsPending} rounded="md" color="brand">
                  Review or Edit
                </Badge>
              </Stack>
            </Stack>
          </form>
        ) : (
          <>
            {showAuthForm()}
            <Button
              variant="icon"
              className="hover:underline underline-offset-4"
              onClick={function () {
                setMode(function (p) {
                  return p === "login" ? "register" : "login";
                });
              }}
            >
              {mode === "login"
                ? "Don't have an Account ? Register"
                : "Already have an account ? login"}
            </Button>
          </>
        )}
      </section>
    </section>
  );
}

export default ScheduleModal;
