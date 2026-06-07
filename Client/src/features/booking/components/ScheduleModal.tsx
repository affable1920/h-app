import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

import type {
  APIError,
  Clinic,
  Doctor,
  PatientCreate,
  Slot,
} from "@/types/http";
import {
  useBookingMutation,
  useUnbookingMutation,
} from "@/features/booking/use-booking";
import { toast } from "sonner";
import useModalStore from "@stores/modalStore";

import useAuthStore from "@stores/authStore";
import { MapPinCheckInside } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useSignup } from "@/hooks/use-auth";
import { PatientCreateSchema } from "@/schemas";
import { fromISO } from "@/utils/utils";
import Badge from "@/components/ui/Badge";
import { Stack } from "@/components/ui/Stack";

type ScheduleModalProps = {
  doctor: Doctor;
  slot: Slot;
  clinic: Clinic;
};

function ScheduleModal({ doctor, slot, clinic }: ScheduleModalProps) {
  const user = useAuthStore((s) => s.user);

  const form = useForm<PatientCreate>({
    resolver: zodResolver(PatientCreateSchema),
  });

  const {
    formState: { errors },
  } = form;

  const slotDatetimeISO = fromISO(slot.slot_datetime);
  const fullDate = slotDatetimeISO.toFormat("dd LLL - yyyy");

  const closeModal = useModalStore((s) => s.closeModal);

  const book = useBookingMutation();
  const { mutate: unBook } = useUnbookingMutation();

  const signup = useSignup();

  async function confirmSlot() {
    if (!slot) {
      return;
    }

    const appointment = {
      slotId: slot.id,
      date: slot.slot_datetime,
      doctorId: doctor.id,
    };

    const createdAppointment = await book.mutateAsync(appointment, {
      onSuccess() {
        toast.info("Slot booked successfully !", {
          description() {
            return "Slots are confirmed within 30 minutes. You can edit or cancel your slot till then";
          },

          action: {
            label: "Undo",
            onClick() {
              unBook({
                appointmentId: createdAppointment.id,
                doctorId: doctor.id,
              });
            },
          },

          duration: 5000,
          closeButton: true,
        });

        closeModal();
      },

      onError(error) {
        const resolved = error as unknown as APIError;

        toast.error(resolved.type, {
          description() {
            return resolved.msg;
          },
        });
      },
    });
  }

  async function confirmOnboarding(data: PatientCreate) {
    await signup.mutateAsync({ data, route: "patient" });
  }

  return (
    <section className="p-3">
      <header
        className="bg-layout-raised p-3 rounded-sm min-h-fit flex flex-col gap-1 shadow-sm 
      shadow-black/20 border-2 border-border"
      >
        <h3 className="text-text-secondary">Dr. {doctor.name}</h3>

        <div className="self-end justify-self-end flex flex-col gap-1 items-end text-sm font-semibold">
          <p className="capitalize underline">{slotDatetimeISO.weekdayShort}</p>

          <span className="flex items-center gap-4">
            {fullDate && <p>{fullDate}</p>}
            <p className="text-text">
              {slotDatetimeISO.toISOTime()?.split("+")[1]}
            </p>
          </span>
        </div>
      </header>

      <section className="mt-4 flex flex-col gap-8 px-3">
        <div className="flex flex-col text-sm gap-1">
          <div className="flex items-center gap-2">
            <h2 className="line-clamp-1 text-text-secondary">{clinic?.name}</h2>

            <Button variant="icon" data-tooltip="Get exact location !">
              <MapPinCheckInside className={"size-3!"} />
            </Button>
          </div>
        </div>

        {user ? (
          <form
            onSubmit={form.handleSubmit(confirmSlot)}
            className="flex flex-col gap-6"
          >
            <Stack orientation="V">
              <Stack align="center" justify="between">
                <Button type="button" onClick={closeModal}>
                  cancel
                </Button>

                <Button
                  onClick={confirmSlot}
                  type="submit"
                  color="white"
                  loading={book.isPending}
                >
                  Confirm Slot
                </Button>
              </Stack>

              <Badge disabled={book.isPending} color="brand">
                Review or Edit
              </Badge>
            </Stack>
          </form>
        ) : (
          <form
            onSubmit={form.handleSubmit(confirmOnboarding)}
            className="flex flex-col gap-6 shadow-lg p-4 rounded-md"
          >
            <h1 className="text-lg text-center font-black leading-tight">
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
              <Button type="submit" color="white" loading={signup.isPending}>
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
