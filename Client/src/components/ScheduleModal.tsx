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

import { type PatientDetails, PatientSchema } from "@/schemas";
import { useSearchParams } from "react-router-dom";
import { DateTime } from "luxon";

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

  const form = useForm<PatientDetails>({
    resolver: zodResolver(PatientSchema),
  });

  const {
    formState: { errors },
  } = form;

  const closeModal = useModalStore((s) => s.closeModal);

  const { mutateAsync: book, isPending } = useBookingMutation();
  const { mutate: unBook } = useUnbookingMutation();

  async function confirmSlot(details: PatientDetails) {
    const validated = PatientSchema.parse(details);

    if (!slot || !dtParams) {
      return;
    }

    const baseDetails = {
      slotId: slot.id,
      date: dtParams.toISO()!,
      doctorId: dr.id,
    };

    const appointment = user?.id
      ? { patientId: user.id, ...baseDetails }
      : { ...baseDetails, ...validated };

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

  return (
    <section className="flex flex-col text-sm justify-end gap-8 p-4">
      <div className="flex flex-col bg-primary-light/90 gap-1 text-white p-2 rounded-sm min-h-fit">
        <h2>Dr. {dr.name}</h2>
        <span className="inline-flex flex-col items-end-safe gap-0.5">
          <h2 className="capitalize">{dtParams.weekdayShort}</h2>
          {dateString && <h2>{dateString}</h2>}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {clinic && (
          <div className="flex items-center justify-between">
            <h2 className="line-clamp-1">{clinic.name}</h2>

            <Button variant="ghost" data-tooltip="Get exact location !">
              <MapPinCheckInside />
            </Button>
          </div>
        )}

        {slot && (
          <div className="flex items-center gap-1 -mt-1.5">
            <h2>{slot.begin}</h2>
            <Button disabled variant="ghost" data-tooltip="Edit slot !">
              <Pencil color="gray" />
            </Button>
          </div>
        )}
      </div>

      <form
        onSubmit={form.handleSubmit(confirmSlot)}
        className="flex flex-col gap-6"
      >
        <Input
          autoFocus
          {...form.register("name")}
          label="name"
          error={errors.name?.message}
          className="italic font-semibold text-sm"
        />

        <Input
          {...form.register("contact")}
          label="contact"
          error={errors.contact?.message}
          className="italic font-semibold text-sm"
        />

        <div className="flex items-center justify-between">
          <Button type="button" color="secondary" onClick={closeModal}>
            cancel
          </Button>

          <Button type="submit" color="accent" loading={isPending}>
            Confirm Slot
          </Button>
        </div>
      </form>
    </section>
  );
}

export default ScheduleModal;
