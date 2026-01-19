import z from "zod";
import React, { useState, type FormEvent } from "react";

import Text from "@components/common/Text";
import Input from "@components/common/Input";
import Button from "@components/common/Button";

import type { Doctor } from "@/types/doctorAPI";

import { toast } from "sonner";
import useModalStore from "@stores/modalStore";
import useSchedulesMutation from "@/hooks/useSchedulesMutation";

import { useAuth } from "./providers/AuthProvider";
import { Pencil, MapPinCheckInside } from "lucide-react";
import { useSchedule } from "./providers/ScheduleProvider";

const PatientSchema = z.object({
  name: z.string("please input a valid name").min(4, "A name is required"),
  contact: z
    .string("please input a valid 10 digit contact number")
    .min(10, "contact number should exactly have 10 digits"),
});

type Patient = z.infer<typeof PatientSchema>;

function ScheduleModal() {
  const { state: scheduleState } = useSchedule();
  const { date, clinic, slot, schedule } = scheduleState;

  const { user } = useAuth();
  const dateString = date?.toFormat("dd LLL yyyy");

  const { dr } = useModalStore((s) => s.modalProps) as {
    dr: Doctor;
  };

  const [patient, setPatient] = useState<Patient>({
    name: user?.username ?? "",
    contact: "",
  });

  const [errors, setErrors] = useState<{ [K in keyof Patient]?: string }>({});

  function handleChange({
    target: { name = "", value = "" },
  }: React.ChangeEvent<HTMLInputElement>) {
    setPatient((p) => ({
      ...p,
      [name]: value,
    }));
  }

  const closeModal = useModalStore((s) => s.closeModal);

  const { bookMutation } = useSchedulesMutation();
  const { mutateAsync, isPending } = bookMutation(dr.id);

  async function confirmSlot(e: FormEvent) {
    e.preventDefault();
    setErrors({});

    const validation = PatientSchema.safeParse(patient);

    if (!validation.success) {
      validation.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof Patient;
        setErrors((prev) => ({ ...prev, [field]: issue.message }));
      });

      return;
    }

    let data: any = {
      slotId: slot?.id!,
      clinicId: clinic?.id!,
      date: date?.toISO() as string,
      scheduleId: schedule?.id as string,
    };

    if (user?.id) {
      data.patientId = user.id;
    } else {
      data = { ...data, ...patient };
    }

    try {
      await mutateAsync(data);

      toast.info("Slot booked successfully !", {
        action: {
          label: "Undo",
          onClick() {
            /* Implement slot undo later. */
          },
        },
        duration: 4000,
      });

      closeModal();
    } catch (error) {
      console.log(error);

      // toast.error(error as string);
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
              disabled
              size="xs"
              variant="icon"
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
            value={patient.name}
            onChange={handleChange}
            aria-invalid={!!errors.name}
            className={`italic font-semibold text-sm`}
          />
          {errors.name && <Input.Error msg={errors.name} />}
        </Input>

        {user?.email && (
          <Input>
            <Input.Label>email</Input.Label>
            <Input.InputElement
              name="email"
              value={user.email}
              onChange={(e) => console.log(e)}
              className="italic font-semibold text-sm"
            />
          </Input>
        )}

        <Input className="relative">
          <Input.Label>contact</Input.Label>
          <Input.InputElement
            name="contact"
            value={patient.contact}
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

          <Button type="submit" loading={isPending} onClick={confirmSlot}>
            Confirm Slot
          </Button>
        </div>
      </form>
    </section>
  );
}

export default ScheduleModal;
