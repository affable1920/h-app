import { useState, type SubmitEvent } from "react";
import { toast } from "sonner";
import { Ban, CalendarFold, MapPinCheckInside, X } from "lucide-react";

import useModalStore, { removeModal } from "@/stores/modal-store";
import useAuthStore from "@/stores/auth-store";

import {
  useCancelBooking,
  useCreateBooking,
} from "@/features/booking/api/mutations";

import { fromISO } from "@/domain/scheduling/utils";
import type { APIError, Clinic, Doctor, Slot } from "@/types/http";

import Button from "@/components/ui/Button";
import { Stack } from "@/components/ui/Stack";
import { PatientSignin } from "@/components/PatientSignin";
import { PatientRegister } from "@/components/PatientRegister";

type BookingGateProps = {
  doctor: Doctor;
  slot: Slot;
  clinic: Clinic;
  onSuccess?: () => void;
};

function BookingGate({ doctor, slot, clinic, onSuccess }: BookingGateProps) {
  const slotDatetimeISO = fromISO(slot.slotDatetime);
  const fullDate = slotDatetimeISO.toFormat("dd LLL yyyy -");

  const user = useAuthStore((s) => s.user);
  const role = useAuthStore((s) => s.role);

  const closeModal = useModalStore((s) => s.closeModal);

  const { mutateAsync: book, isPending: bookingIsPending } = useCreateBooking();
  const { mutate: cancelBooking } = useCancelBooking();

  const [mode, setMode] = useState<"login" | "register">("login");

  async function confirmSlot(ev: SubmitEvent<HTMLFormElement>) {
    ev.preventDefault();

    const formData = new FormData(ev.currentTarget);
    const reason = formData.get("reasonForVisit");

    if (!slot) {
      return;
    }

    const payload = {
      slotId: slot.id,
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
      removeModal();
    } catch (exc) {
      const ex = exc as unknown as APIError;
      toast.error(ex.code, {
        description: ex.message,
      });
    }
  }

  function showAuthForm() {
    return mode === "login" ? <PatientSignin /> : <PatientRegister />;
  }

  return (
    <section className="p-6">
      <header
        className="bg-layout-raised/50 p-3 rounded-md space-y-6 shadow-sm shadow-black/5  
        border border-border-strong"
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
            <span>{slotDatetimeISO.toFormat("HH:mm")}</span>
          </Stack>
        </Stack>
      </header>

      <section className="mt-6">
        {user && role === "patient" ? (
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
                  <Button
                    type="button"
                    endIcon={<Ban />}
                    color="secondary"
                    onClick={closeModal}
                  >
                    cancel
                  </Button>

                  <Button
                    type="submit"
                    color="white"
                    loading={bookingIsPending}
                    endIcon={<CalendarFold />}
                  >
                    Book
                  </Button>
                </Stack>

                <Button
                  disabled={bookingIsPending}
                  onClick={removeModal}
                  color="indicator"
                >
                  Review or Edit
                </Button>
              </Stack>
            </Stack>
          </form>
        ) : role === "doctor" ? (
          <div className="space-y-4 text-center">
            <p className="text-text-normal">
              Doctor accounts cannot book appointments{" "}
            </p>
            <Button endIcon={<X />} type="button" onClick={closeModal}>
              Close
            </Button>
          </div>
        ) : (
          <>
            {showAuthForm()}
            <Button
              variant="icon"
              className="hover:underline underline-offset-4 mt-4 text-sm w-full"
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

export default BookingGate;
