import z from "zod";
import React, { useState } from "react";

import Text from "@components/common/Text";
import Input from "@components/common/Input";
import Button from "@components/common/Button";

import type { Doctor } from "@/types/doctorAPI";

import useModalStore from "@stores/modalStore";
import useSchedulesMutation from "@hooks/useSchedulesMutation";

import { toast } from "sonner";
import { FaEdit } from "react-icons/fa";
import { RiMapPin2Fill } from "react-icons/ri";
import { useSchedule } from "./providers/ScheduleProvider";

const PatientSchema = z.object({
  patientName: z
    .string()
    .min(4, { abort: true, error: "Patient's name is required !" }),
  patientContact: z
    .string({ error: "Please enter a valid 10 digit contact number !" })
    .min(10, {
      abort: true,
      error: "Contact number should exactly have 10 digits !",
    }),
});

function ScheduleModal() {
  const { state: scheduleState } = useSchedule();
  const { date, clinic, slot } = scheduleState;

  const dateString = date?.toFormat("dd LLL yyyy");

  const { dr } = useModalStore((s) => s.modalProps) as {
    dr: Doctor;
  };

  const [patient, setPatient] = useState({
    patientName: "",
    patientContact: "",
  });

  function handleChange({
    target: { name = "", value = "" },
  }: React.ChangeEvent<HTMLInputElement>) {
    setPatient((p) => ({ ...p, [name]: value }));
  }

  const openModal = useModalStore((s) => s.openModal);
  const closeModal = useModalStore((s) => s.closeModal);
  const { mutateAsync, isPending } = useSchedulesMutation(dr.id as string);

  async function confirmSlot() {
    await mutateAsync(
      { patientData: patient },
      {
        async onSuccess(_, __, ___, context) {
          const knownData = { ...patient };

          toast.info("Slot booked successfully !", {
            action: {
              label: "Undo",
              onClick() {
                /* Implement slot undo later. */
              },
            },
          });

          setPatient({
            patientName: "",
            patientContact: "",
          });

          context.client.invalidateQueries();
          closeModal();

          setTimeout(function () {
            openModal("memberModal", {
              data: knownData,
            });
          }, 2000);
        },

        async onError(error) {
          const { msg = "Error", detail = "", description = "" } = error as any;
          toast.error(msg ?? detail, { description });
        },
      }
    );
  }

  return (
    <section className="flex flex-col justify-end gap-8 p-4">
      <div className="flex items-center justify-between bg-primary-lightest text-white p-2 rounded-sm">
        <Text className="self-end" bold content={"Dr. " + dr?.fullname} />
        <span className="inline-flex flex-col items-end">
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
              className="line-clamp-1"
              content={clinic.head}
            />
            <Button
              size="xs"
              variant="icon"
              data-tooltip="Get exact location !"
            >
              <RiMapPin2Fill />
            </Button>
          </div>
        )}

        {slot && (
          <div className="flex items-center gap-1 -mt-1.5">
            <Text bold size="sm" content={slot.begin} />
            <Button data-tooltip="Edit slot !" variant="icon" size="xs">
              <FaEdit color="gray" />
            </Button>
          </div>
        )}
      </div>

      <section className="flex flex-col gap-4">
        <Input>
          <Input.Label>name</Input.Label>
          <Input.InputElement
            name="patientName"
            onChange={handleChange}
            value={patient.patientName}
            className="italic font-semibold text-sm"
          />
        </Input>

        <Input>
          <Input.Label>contact</Input.Label>
          <Input.InputElement
            type="string"
            name="patientContact"
            onChange={handleChange}
            value={patient.patientContact}
            className="italic font-semibold text-sm"
          />
        </Input>

        <div className="flex items-center justify-between">
          <Button onClick={closeModal} color="danger">
            cancel
          </Button>

          <Button color="accent" loading={isPending} onClick={confirmSlot}>
            Confirm Slot
          </Button>
        </div>
      </section>
    </section>
  );
}

export default ScheduleModal;
