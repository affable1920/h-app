import Input from "@components/common/Input";
import Button from "@components/common/Button";

import type { Doctor } from "@/types/http";
import { useBookingMutation, useUnbookingMutation } from "@/hooks/bookings";
import { toast } from "sonner";
import useModalStore from "@stores/modalStore";

import useAuthStore from "@stores/authStore";
import { Pencil, MapPinCheckInside } from "lucide-react";
import { useSchedule } from "./providers/ScheduleProvider";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { type PatientDetails, PatientSchema } from "@/schemas";

function ScheduleModal() {
  const user = useAuthStore((s) => s.user);
  const { state: scheduleState } = useSchedule();

  const { date, clinic, slot, schedule } = scheduleState;
  const dateString = date?.toFormat("dd LLL yyyy");

  const form = useForm<PatientDetails>({
    resolver: zodResolver(PatientSchema),
  });

  const {
    formState: { errors },
  } = form;

  const closeModal = useModalStore((s) => s.closeModal);
  const { dr } = useModalStore((s) => s.modalProps) as {
    dr: Doctor;
  };

  const { mutateAsync: book, isPending } = useBookingMutation(dr.id);
  const { mutate: unBook } = useUnbookingMutation();

  async function confirmSlot(details: PatientDetails) {
    const validated = PatientSchema.parse(details);

    if (!slot?.id || !date || !schedule?.id) {
      return;
    }

    let data: any = {
      slotId: slot.id,
      clinicId: clinic?.id,
      date: date.toISO(),
      scheduleId: schedule.id,
    };

    if (user?.id) {
      data = { ...data, patientId: user.id };
    } else {
      data = { ...data, ...validated };
    }

    const createdAppointment = await book(data, {
      successFn() {
        toast.info("Slot booked successfully !", {
          action: {
            label: "Undo",

            onClick() {
              unBook({ appointmentId: createdAppointment.id, doctorId: dr.id });
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
        <h2 className="card-h2">{dr.fullname}</h2>
        <span className="inline-flex flex-col items-end-safe">
          <h2 className="capitalize">{date?.weekdayShort}</h2>
          {dateString && <h2 className="card-h2">{dateString}</h2>}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {clinic && (
          <div className="flex items-center justify-between">
            <h2 className="line-clamp-1">{clinic.head}</h2>

            <Button variant="ghost" data-tooltip="Get exact location !">
              <MapPinCheckInside />
            </Button>
          </div>
        )}

        {slot && (
          <div className="flex items-center gap-1 -mt-1.5">
            <h2 className="card-h2">{slot.begin}</h2>
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
          error={errors.name?.message}
          className={`italic font-semibold text-sm`}
        />

        {user?.email && (
          <Input
            label="email"
            type="email"
            name="email"
            className="italic font-semibold text-sm"
          />
        )}

        <Input
          {...form.register("contact")}
          aria-invalid={!!errors.contact}
          className="italic font-semibold text-sm"
          error={errors.contact?.message}
        />

        <div className="flex items-center justify-between">
          <Button type="button" onClick={closeModal}>
            cancel
          </Button>

          <Button type="submit" loading={isPending}>
            Confirm Slot
          </Button>
        </div>
      </form>
    </section>
  );
}

export default ScheduleModal;
