import { toast } from "sonner";

import Text from "./base/Text";
import Button from "./eventElements/Button";
import type { Doctor } from "@/types/doctorAPI";

import useModalStore from "@/stores/modalStore";
import useScheduleStore from "@/stores/scheduleStore";
import useSchedulesMutation from "@/hooks/useSchedulesMutation";

import { FaEdit } from "react-icons/fa";
import { RiMapPin2Fill } from "react-icons/ri";
import Input from "./eventElements/Input";
import React, { useState } from "react";

function ScheduleModal() {
  const [patient, setPatient] = useState({
    patientName: "",
    patientContact: "",
  });

  const selectedSlot = useScheduleStore((s) => s.selectedSlot);
  const selectedClinic = useScheduleStore((s) => s.selectedClinic);

  const selectedDate = useScheduleStore((s) => s.selectedDate);
  const date = selectedDate?.toFormat("dd LLL yyyy");

  const { mutate } = useSchedulesMutation();
  const { dr } = useModalStore((s) => s.modalProps) as {
    dr: Doctor;
  };

  async function confirmSlot() {
    try {
      mutate({ id: dr.id!, patientDetails: patient });
      toast.info("Slot booked successfully !");
    } catch (ex) {
      toast.error((ex as Error).message as string);
    }
  }

  function handleChange({
    target: { name = "", value = "" },
  }: React.ChangeEvent<HTMLInputElement>) {
    setPatient((p) => ({ ...p, [name]: value }));
  }

  return (
    <section className="flex flex-col justify-end gap-8 p-4">
      <div className="flex items-center justify-between">
        <Text bold content={"Dr. " + dr?.name} />
        <span className="inline-flex flex-col items-end">
          <Text size="xs" bold content={date as string} />
          <Text
            size="sm"
            className="capitalize"
            content={selectedDate?.weekdayShort as string}
          />
        </span>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center justify-between">
          <Text bold content={selectedClinic?.name as string} />
          <Button data-tooltip="Get exact location !" variant="icon">
            <RiMapPin2Fill className="size-3" />
          </Button>
        </div>

        <div className="flex items-center gap-1 -mt-1.5">
          <Text bold size="sm" content={selectedSlot?.begin as string} />
          <Button data-tooltip="Edit slot !" variant="icon">
            <FaEdit className="size-3" color="gray" />
          </Button>
        </div>
      </div>

      {/* <section>
        <div
          className="flex items-center justify-between bg-blue-400 
        text-white rounded-sm px-2 text-sm"
        >
          <Button variant="icon">Quick book</Button>
          <Button variant="icon">Sign up / Log in</Button>
        </div>
      </section> */}

      <div className="flex flex-col gap-4">
        <Input
          label="name"
          labelClasses="sm"
          name="patientName"
          onChange={handleChange}
          value={patient.patientName}
          className="italic font-semibold text-sm"
        />
        <Input
          label="contact"
          labelClasses="sm"
          name="patientContact"
          onChange={handleChange}
          type="number"
          value={patient.patientContact}
          className="italic font-semibold text-sm [&:invalid]:bg-black"
        />
      </div>

      <div className="flex items-center justify-between gap-8 text-sm">
        <Button
          color="danger"
          variant="contained"
          onClick={useModalStore.getState().closeModal}
        >
          Cancel
        </Button>

        <Button
          color="accent"
          variant="contained"
          onClick={confirmSlot}
          disabled={!Object.values(patient).every((v) => !!v)}
        >
          Confirm Slot
        </Button>
      </div>
    </section>
  );
}

export default ScheduleModal;
