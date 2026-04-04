import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

import type { Clinic, Doctor, Slot } from "@/types/http";
import { useBookingMutation, useUnbookingMutation } from "@/hooks/bookings";
import { toast } from "sonner";
import useModalStore from "@stores/modalStore";

import useAuthStore from "@stores/authStore";
import { Pencil, MapPinCheckInside } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { PatientSchema, UserSchema, type CreateUser } from "@/schemas";
import { useSearchParams } from "react-router-dom";
import { DateTime } from "luxon";
import { useSignup } from "@/hooks/auth";

function ScheduleModal({
  dr,
  slot,
  clinic,
}: {
  dr: Doctor;
  slot: Slot;
  clinic: Clinic;
}) {
  const user = useAuthStore((s) => s.user);

  const [searchParams] = useSearchParams();
  const dtParams = DateTime.fromISO(searchParams.get("date") ?? "");

  const dateString = dtParams.toFormat("dd LLL yyyy");

  const form = useForm<CreateUser>({
    resolver: zodResolver(UserSchema),
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

    const ptnt = user
      ? Object.create(null)
      : { ...PatientSchema.parse(form.getValues()) };

    const baseDetails = {
      slotId: slot.id,
      date: dtParams.toISO()!,
      doctorId: dr.id,
    };

    const appointment = { ...ptnt, ...baseDetails };

    const createdAppointment = await book(appointment, {
      onSuccess() {
        toast.info("Slot booked successfully !", {
          action: {
            label: "Undo",

            onClick() {
              unBook({
                appointmentId: createdAppointment.id,
                doctorId: dr.id,
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

  async function confirmOnboarding(data: CreateUser) {
    await signup(data);
  }

  return (
    <section className="flex flex-col justify-end gap-8 p-4">
      <div className="flex flex-col bg-primary-light/90 gap-1 text-white p-2 rounded-sm min-h-fit">
        <h2>Dr. {dr.name}</h2>
        <span className="inline-flex flex-col items-end gap-0.5 text-sm">
          <h2 className="capitalize">{dtParams.weekdayShort}</h2>
          {dateString && <h2>{dateString}</h2>}
        </span>
      </div>

      <div className="flex flex-col gap-2 text-sm">
        {clinic && (
          <div className="flex items-center gap-2">
            <h2 className="line-clamp-1">{clinic.name}</h2>

            <Button variant="ghost" data-tooltip="Get exact location !">
              <MapPinCheckInside className={"size-3!"} />
            </Button>
          </div>
        )}

        {slot && (
          <div className="flex items-center gap-2">
            <h2>{slot.begin}</h2>
            <Button variant="ghost" data-tooltip="Edit slot !">
              <Pencil className={"size-3!"} color="gray" />
            </Button>
          </div>
        )}
      </div>

      {user?.id ? (
        <form
          onSubmit={form.handleSubmit(confirmSlot)}
          className="flex flex-col gap-6"
        >
          <div className="flex items-center justify-between">
            <Button type="button" color="secondary" onClick={closeModal}>
              cancel
            </Button>

            <Button
              onClick={confirmSlot}
              type="submit"
              color="accent"
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
          <h1 className="text-lg text-center text-accent-dark font-black leading-tight">
            Get Onboard now to confirm your slot!
          </h1>
          <Input
            autoFocus
            {...form.register("username")}
            label="name"
            error={errors.username?.message}
            className="italic font-semibold text-sm"
          />

          <Input
            {...form.register("email")}
            label="email"
            error={errors.email?.message}
            className="italic font-semibold text-sm"
          />
          <Input
            {...form.register("password")}
            label="set a password"
            error={errors.password?.message}
            className="font-bold italic text-sm"
          />
          <div className="flex items-center justify-between">
            <Button type="button" color="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" color="accent" loading={signupIsPending}>
              Sign up
            </Button>
          </div>
        </form>
      )}
    </section>
  );
}

export default ScheduleModal;
