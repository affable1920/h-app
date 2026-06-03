import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

import type { Clinic, PatientCreate, Slot } from "@/types/http";
import {
  useBookingMutation,
  useUnbookingMutation,
} from "@/features/booking/use-booking";
import { toast } from "sonner";
import useModalStore from "@stores/modalStore";

import useAuthStore from "@stores/authStore";
import { Pencil, MapPinCheckInside } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useSearchParams } from "react-router-dom";
import { DateTime } from "luxon";
import { useSignup } from "@/hooks/use-auth";
import { PatientCreateSchema } from "@/schemas";

function ScheduleModal({
  slot,
  clinic,
  doctorId,
  doctorName,
}: {
  doctorId: string;
  doctorName: string;
  slot: Slot;
  clinic: Clinic;
}) {
  const user = useAuthStore((s) => s.user);

  const [searchParams] = useSearchParams();
  const dtParams = DateTime.fromISO(searchParams.get("date") ?? "");

  const dateString = dtParams.toFormat("dd LLL yyyy");

  const form = useForm<PatientCreate>({
    resolver: zodResolver(PatientCreateSchema),
  });

  const {
    formState: { errors },
  } = form;

  const closeModal = useModalStore((s) => s.closeModal);

  const { mutateAsync: book, isPending } = useBookingMutation();
  const { mutate: unBook } = useUnbookingMutation();

  const { mutateAsync: signup, isPending: signupIsPending } = useSignup();

  async function confirmSlot() {
    if (!slot || !dtParams) {
      return;
    }

    const appointment = {
      slotId: slot.id,
      date: dtParams.toISO()!,
      doctorId: doctorId,
      clinicId: clinic.id,
    };

    const createdAppointment = await book(appointment, {
      onSuccess() {
        toast.info("Slot booked successfully !", {
          action: {
            label: "Undo",

            onClick() {
              unBook({
                appointmentId: createdAppointment.id,
                doctorId: doctorId,
              });
            },
          },

          duration: 4000,
        });

        closeModal();
      },

      onError(error) {
        toast.error(error.name, {
          description() {
            return error.message;
          },
        });
      },
    });
  }

  async function confirmOnboarding(data: PatientCreate) {
    await signup({ data, route: "patient" });
  }

  return (
    <section className="p-3">
      <header
        className="bg-layout-raised p-3 rounded-sm min-h-fit flex flex-col gap-1 shadow-sm 
      shadow-black/20 border-2 border-border"
      >
        <h3 className="text-text-secondary">Dr. {doctorName}</h3>

        <div className="self-end justify-self-end flex flex-col items-end text-sm font-semibold">
          <p className="capitalize">{dtParams.weekdayShort}</p>
          {dateString && <p>{dateString}</p>}
        </div>
      </header>

      <section className="mt-4 flex flex-col gap-8 px-3">
        <div className="flex flex-col text-sm gap-1">
          <div className="flex items-center gap-2">
            <h2 className="line-clamp-1 text-text-secondary">{clinic.name}</h2>

            <Button variant="icon" data-tooltip="Get exact location !">
              <MapPinCheckInside className={"size-2!"} />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <h2 className="text-text-secondary">{slot.slot_datetime}</h2>
            <Button variant="icon" data-tooltip="Edit slot !">
              <Pencil className={"size-2!"} />
            </Button>
          </div>
        </div>

        {user ? (
          <form
            onSubmit={form.handleSubmit(confirmSlot)}
            className="flex flex-col gap-6"
          >
            <div className="flex items-center justify-between">
              <Button type="button" onClick={closeModal}>
                cancel
              </Button>

              <Button
                onClick={confirmSlot}
                type="submit"
                color="white"
                loading={isPending}
              >
                Confirm Slot
              </Button>
            </div>
          </form>
        ) : (
          <form
            onSubmit={form.handleSubmit(confirmOnboarding)}
            className="flex flex-col gap-6 shadow-lg p-4 rounded-md"
          >
            <h1 className="text-lg text-center text-accentdark font-black leading-tight">
              Get Onboard now to confirm your slot!
            </h1>
            <Input
              autoFocus
              {...form.register("username")}
              label="name"
              error={errors["username"]}
              className="italic font-semibold text-sm"
            />

            <Input
              {...form.register("email")}
              label="email"
              error={errors.email}
              className="italic font-semibold text-sm"
            />
            <Input
              {...form.register("password")}
              label="set a password"
              error={errors.password}
              className="font-bold italic text-sm"
            />
            <div className="flex items-center justify-between">
              <Button type="button" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="submit" color="white" loading={signupIsPending}>
                Sign up
              </Button>
            </div>
          </form>
        )}
      </section>
    </section>
  );
}

export default ScheduleModal;
