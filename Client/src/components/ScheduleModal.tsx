import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";

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
import { TbAuth2Fa } from "react-icons/tb";
import { SiAuthentik } from "react-icons/si";
import { UserPlus } from "lucide-react";
import Spinner from "./Spinner";

type Mode = {
  label: string;
  name: "auth" | "quick";
};

const modeStyles: React.CSSProperties = {
  minHeight: "100px",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  gap: "1.4rem",
};

const bookingModes: Mode[] = [
  {
    name: "quick",
    label: "quick book",
  },
  {
    name: "auth",
    label: "login / signup",
  },
];

function ScheduleModal() {
  const [selectedMode, setSelectedMode] = useState<Mode>(bookingModes[0]);
  const selectedSlot = useScheduleStore((s) => s.selectedSlot);
  const selectedClinic = useScheduleStore((s) => s.selectedClinic);

  const selectedDate = useScheduleStore((s) => s.selectedDate);
  const date = selectedDate?.toFormat("dd LLL yyyy");

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

          openModal("memberModal", {
            data: knownData,
          });
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
        <Text className="self-end" bold content={"Dr. " + dr?.name} />
        <span className="inline-flex flex-col items-end">
          <Text
            bold
            size="sm"
            className="capitalize"
            content={selectedDate?.weekdayShort as string}
          />
          <Text bold size="xs" content={date as string} />
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

      <section className="flex flex-col gap-4">
        <AnimatePresence mode="wait">
          <motion.div
            style={modeStyles}
            key={selectedMode.name}
            exit={{ x: 10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.2 }}
            initial={{ x: -10, opacity: 0 }}
          >
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
            <div className="flex items-center justify-between gap-8 text-sm">
              <Button color="danger" variant="contained" onClick={closeModal}>
                Cancel
              </Button>

              <Button
                color="accent"
                loading={isPending}
                variant="contained"
                onClick={confirmSlot}
              >
                Confirm Slot
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </section>
    </section>
  );
}

export default ScheduleModal;

function LoginSignup() {
  const [user, setUser] = useState({
    email: "",
    password: "",
  });

  function handleChange({
    target: { name = "", value = "" },
  }: React.ChangeEvent<HTMLInputElement>) {
    setUser((p) => ({ ...p, [name]: value }));
  }

  return (
    <>
      <Input
        label="email"
        labelClasses="sm"
        name="email"
        onChange={handleChange}
        value={user.email}
        className="italic font-semibold text-sm"
      />
      <Input
        type="password"
        label="password"
        labelClasses="sm"
        name="password"
        onChange={handleChange}
        value={user.password}
        className="italic font-semibold text-sm"
      />

      <div className="flex items-center justify-end text-sm">
        <Button>Continue to book</Button>
      </div>
    </>
  );
}
