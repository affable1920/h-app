import React, { useState, type ReactElement } from "react";
import { AnimatePresence, motion } from "motion/react";

import Badge from "./common/Badge";
import Text from "@components/common/Text";
import Input from "@components/common/Input";
import Button from "@components/common/Button";

import type { Doctor } from "@/types/doctorAPI";

import useModalStore from "@stores/modalStore";
import useScheduleStore from "@stores/scheduleStore";
import useSchedulesMutation from "@hooks/useSchedulesMutation";

import { toast } from "sonner";
import { FaEdit } from "react-icons/fa";
import { RiMapPin2Fill } from "react-icons/ri";

type Mode = {
  label: string;
  children: ReactElement;
  name: "auth" | "quick";
};

function ScheduleModal() {
  const [selectedMode, setSelectedMode] = useState<Mode>(bookingModes[0]);
  const [patient, setPatient] = useState({
    patientName: "",
    patientContact: "",
  });

  const closeModal = useModalStore((s) => s.closeModal);

  const selectedSlot = useScheduleStore((s) => s.selectedSlot);
  const selectedClinic = useScheduleStore((s) => s.selectedClinic);

  const selectedDate = useScheduleStore((s) => s.selectedDate);
  const date = selectedDate?.toFormat("dd LLL yyyy");

  const { dr } = useModalStore((s) => s.modalProps) as {
    dr: Doctor;
  };

  const { mutateAsync } = useSchedulesMutation(dr.id as string);

  async function confirmSlot() {
    await mutateAsync(
      { patientData: patient },
      {
        async onSuccess(_, __, ___, context) {
          setPatient({
            patientName: "",
            patientContact: "",
          });

          toast.info("Slot booked successfully !", {
            action: {
              label: "Undo",
              onClick() {
                /* Implement slot undo later. */
              },
            },
          });

          context.client.invalidateQueries();
          closeModal();
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

      <section className="flex flex-col gap-5">
        <article className="flex items-center justify-between">
          {bookingModes.map((mode) => (
            <Badge
              size="xs"
              full={false}
              key={mode.name}
              className="px-2"
              content={mode.label}
              selected={selectedMode.name === mode.name}
              onClick={() => setSelectedMode(mode)}
            />
          ))}
        </article>

        <AnimatePresence mode="wait">
          <motion.div
            key={selectedMode.name}
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 10, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-3"
          >
            {selectedMode.children}
          </motion.div>
        </AnimatePresence>
      </section>

      <div className="flex items-center justify-between gap-8 text-sm">
        <Button color="danger" variant="contained" onClick={closeModal}>
          Cancel
        </Button>

        <Button color="accent" variant="contained" onClick={confirmSlot}>
          Confirm Slot
        </Button>
      </div>
    </section>
  );
}

export default ScheduleModal;

const bookingModes: Mode[] = [
  {
    name: "quick",
    label: "quick book",
    children: <QuickBookSlot />,
  },
  {
    name: "auth",
    label: "login / signup",
    children: <div>Login Signup</div>,
  },
];

function QuickBookSlot() {
  const [patient, setPatient] = useState({
    patientName: "",
    patientContact: "",
  });

  function handleChange({
    target: { name = "", value = "" },
  }: React.ChangeEvent<HTMLInputElement>) {
    setPatient((p) => ({ ...p, [name]: value }));
  }

  return (
    <>
      <Input
        label="name"
        labelClasses="sm"
        name="patientName"
        onChange={handleChange}
        value={patient.patientName}
        className="italic font-semibold text-sm"
      />
      <Input
        type="number"
        label="contact"
        labelClasses="sm"
        name="patientContact"
        onChange={handleChange}
        value={patient.patientContact}
        className="italic font-semibold text-sm"
      />
    </>
  );
}
