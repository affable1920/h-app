import z from "zod";
import React, { useState, type FormEvent } from "react";

import Text from "@components/common/Text";
import Input from "@components/common/Input";
import Button from "@components/common/Button";

import type { Doctor, Slot } from "@/types/doctorAPI";

import useModalStore from "@stores/modalStore";
import useSchedulesMutation from "@hooks/useSchedulesMutation";

import { toast } from "sonner";
import { Pencil, MapPinCheckInside } from "lucide-react";
import { useSchedule } from "./providers/ScheduleProvider";
import type { APIError } from "@/types/errors";
import Dropdown from "./common/Dropdown";

const PatientSchema = z.object({
  name: z.string().min(4, "A name is required"),
  contact: z.string().min(10, "contact number should exactly have 10 digits"),
});

type Patient = z.infer<typeof PatientSchema>;

function ScheduleModal() {
  const { state: scheduleState, actions } = useSchedule();
  const { date, clinic, slot, schedule } = scheduleState;

  const dateString = date?.toFormat("dd LLL yyyy");

  const { dr } = useModalStore((s) => s.modalProps) as {
    dr: Doctor;
  };

  const [patient, setPatient] = useState<Patient>({
    name: "",
    contact: "",
  });

  const [isSlotEditable, setIsSlotEditable] = useState(false);

  const [errors, setErrors] = useState<{ [K in keyof Patient]?: string }>({});

  function handleChange({
    target: { name = "", value = "" },
  }: React.ChangeEvent<HTMLInputElement>) {
    setPatient((p) => ({
      ...p,
      [name]: value,
    }));
  }

  const openModal = useModalStore((s) => s.openModal);
  const closeModal = useModalStore((s) => s.closeModal);

  const { mutateAsync, isPending } = useSchedulesMutation(dr.id);

  async function confirmSlot(e: FormEvent) {
    try {
      e.preventDefault();

      const validation = PatientSchema.safeParse(patient);

      if (!validation.success) {
        validation.error.issues.forEach((issue) => {
          setErrors((prev) => ({
            ...prev,
            [issue.path[0]]: issue.message,
          }));
        });

        return;
      }

      const data = {
        patient: { ...patient },

        slotId: slot?.id!,
        clinicId: clinic?.id!,
        date: date?.toISO() as string,
        scheduleId: schedule?.id as string,
      };

      await mutateAsync(data);

      toast.info("Slot booked successfully !", {
        action: {
          label: "Undo",
          onClick() {
            /* Implement slot undo later. */
          },
        },
      });

      closeModal();

      setTimeout(function () {
        openModal("memberModal");
      }, 2000);
    } catch (error) {
      const ex = error as APIError;

      toast.error(ex.type, {
        description() {
          return ex.msg;
        },
        className: "toast-error",
      });
    }
  }

  return (
    <section className="flex flex-col justify-end gap-8 p-4">
      <div className="flex flex-col bg-primary-light/90 gap-1 text-white p-2 rounded-sm min-h-fit">
        <Text bold content={"Dr. " + dr?.fullname} className="card-h2" />
        <span className="inline-flex flex-col items-end-safe">
          <Text
            bold
            size="sm"
            className="capitalize"
            content={date?.weekdayShort as string}
          />
          {dateString && <Text bold size="xs" content={dateString} />}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {clinic && (
          <div className="flex items-center justify-between">
            <Text
              bold
              size="sm"
              content={clinic.head}
              className="line-clamp-1"
            />

            <Button
              size="xs"
              variant="icon"
              data-tooltip="Get exact location !"
            >
              <MapPinCheckInside />
            </Button>
          </div>
        )}

        {slot && (
          <div className="flex items-center gap-1 -mt-1.5">
            <Text bold size="sm" content={slot.begin} />
            <Button
              size="xs"
              variant="icon"
              onClick={() => setIsSlotEditable(true)}
              data-tooltip="Edit slot !"
            >
              <Pencil color="gray" />
            </Button>
          </div>
        )}
      </div>

      <form onSubmit={confirmSlot} className="flex flex-col gap-6">
        <Input>
          <Input.Label>name</Input.Label>
          <Input.InputElement
            autoFocus
            name="name"
            onChange={handleChange}
            aria-invalid={!!errors.name}
            className={`italic font-semibold text-sm`}
          />
          {errors.name && <Input.Error msg={errors.name} />}
        </Input>

        <Input>
          <Input.Label>contact</Input.Label>
          <Input.InputElement
            name="contact"
            onChange={handleChange}
            aria-invalid={!!errors.contact}
            className="italic font-semibold text-sm"
          />
          {errors.contact && <Input.Error msg={errors.contact} />}
        </Input>

        <div className="flex items-center justify-between">
          <Button type="button" onClick={closeModal} color="danger">
            cancel
          </Button>

          <Button
            type="submit"
            color="accent"
            loading={isPending}
            onClick={confirmSlot}
          >
            Confirm Slot
          </Button>
        </div>
      </form>
    </section>
  );
}

export default ScheduleModal;
