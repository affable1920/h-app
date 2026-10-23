import Button from "@/components/lib/button/Button";
import Spinner from "@/components/ui/Spinner";
import {
  PhoneMissed,
  SwitchCamera,
  Camera,
  CameraOff,
  Mic,
  MicOff,
  Volume2,
  VolumeOff,
} from "lucide-react";
import { motion } from "motion/react";
import { ToggledControl, type ToggledControlProps } from "./VideoControl";
import { useEffect, useRef } from "react";
import { useCall } from "../core/use-call";
import { useLoaderData } from "react-router-dom";
import type { AppointmentDetail } from "@/features/appointments/api/queries";
import { Stack } from "@/components/ui/Stack";
import { useVideoControls } from "../core/use-video-controls";
import { cn } from "@/utils/utils";

export function Consultation() {
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  const { callState, ...elements } = useCall();
  const detail = useLoaderData<AppointmentDetail>();

  const localControls = useVideoControls();
  const { show: showRemoteControls, ...remoteControls } = useVideoControls();

  const peer =
    detail.role === "doctor"
      ? detail.appointment.patient.username
      : detail.appointment.doctor.name;

  useEffect(
    function () {
      const localEl = localVideoRef.current;

      if (localEl && elements.local) {
        localEl.srcObject = elements.local;
      }

      const remoteEl = remoteVideoRef.current;

      if (remoteEl && elements.remote) {
        remoteEl.srcObject = elements.remote;
      }
    },
    [elements.local, elements.remote],
  );

  useEffect(
    function () {
      const el = remoteVideoRef.current;

      if (!el) {
        return;
      }

      el.muted = elements.isSpeakerMuted;
    },
    [elements.isSpeakerMuted],
  );

  useEffect(
    function () {
      if (callState === "connected") {
        showRemoteControls();
      }
    },
    [callState, showRemoteControls],
  );

  function hangup() {
    const localEl = localVideoRef.current as HTMLVideoElement;
    const remoteEl = remoteVideoRef.current as HTMLVideoElement;

    localEl.srcObject = null;
    remoteEl.srcObject = null;

    elements.endCall();
  }

  const controls: Array<ToggledControlProps> = [
    {
      isToggled: !!elements.isMicMuted,
      onToggle: elements.toggleMic,
      toggledTooltip: "Mic muted",
      unToggledTooltip: "Mute mic",
      toggledColor: "secondary",
      unToggledColor: "white",
      toggledIcon: <MicOff />,
      unToggledIcon: <Mic />,
    },
    {
      isToggled: !!elements.isSpeakerMuted,
      onToggle: elements.toggleSpeaker,
      toggledColor: "secondary",
      unToggledColor: "white",
      toggledIcon: <VolumeOff />,
      unToggledIcon: <Volume2 />,
      toggledTooltip: "Speaker muted",
      unToggledTooltip: "Mute speaker",
    },
  ];

  if (callState === "idle") {
    return (
      <div className="h-screen flex justify-center">
        <p className="text-text-secondary">No consultation in process ...</p>
      </div>
    );
  }

  if (callState !== "connected") {
    return (
      <div>
        <div
          className="max-w-fit mx-auto overflow-x-hidden gap-2 flex flex-col 
          h-[calc(100vh-40rem)] justify-center"
        >
          <Stack align="center" gap={"sm"}>
            <Spinner />
            <p className="text-lg text-text">
              Establishing a connection with {peer} ...
            </p>
          </Stack>
          <motion.span
            animate={{
              x: ["-50%", "250%"],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              repeatType: "mirror",
            }}
            className="inline-flex w-1/3 h-1 rounded-xs bg-text"
          />
        </div>
      </div>
    );
  }

  return (
    <div
      {...remoteControls.surfaceProps}
      className="group/remote relative w-full h-full rounded-md ring-8 ring-indicator/10 
      overflow-hidden shadow-lg shadow-black/20"
    >
      <div className="w-full h-full">
        <video
          ref={remoteVideoRef}
          className="w-full h-full object-cover"
          autoPlay
        />
      </div>

      <motion.div
        {...remoteControls.controlProps}
        className={cn(
          `flex items-center gap-4 absolute bottom-4 left-1/2 -translate-x-1/2
            [&>*]:rounded-full transition-all duration-300 ease-in-out`,
          remoteControls.visible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-2",
          "group-hover/remote:opacity-100 group-hover/remote:translate-y-0",
          "group-focus-within/remote:opacity-100 group-focus-within/remote:translate-y-0",
        )}
      >
        {controls.map(function (control, i) {
          return <ToggledControl key={i} {...control} />;
        })}
        <Button
          data-tooltip="End call"
          variant="icon"
          bg={true}
          color="danger"
          className="text-text-secondary"
          onClick={hangup}
        >
          <PhoneMissed />
        </Button>
      </motion.div>

      <div
        {...localControls.surfaceProps}
        className="absolute right-4 bottom-4 w-32 h-32 md:w-40 md:h-40 max-w-1/3 max-h-1/3 rounded-md
              shadow-md hover:scale-110 transition-transform duration-300 ease-in-out
              overflow-hidden hover:cursor-pointer group/local"
      >
        <div className="w-full h-full object-cover">
          <video
            className="h-full w-full object-cover"
            muted
            autoPlay
            playsInline
            ref={localVideoRef}
          />
        </div>

        <div
          {...localControls.controlProps}
          className={cn(
            `flex items-center gap-2 [&>*]:rounded-full absolute bottom-2 left-1/2
            -translate-x-1/2 transition-all duration-300 ease-in-out`,
            localControls.visible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-2",
            "group-hover/local:opacity-100 group-hover/local:translate-y-0",
            "group-focus-within/local:opacity-100 group-focus-within/local:translate-y-0",
          )}
        >
          <Button
            data-tooltip="Invert camera"
            variant="icon"
            bg={true}
            color="secondary"
            onClick={function () {
              elements.invertCamera(localVideoRef.current!);
            }}
          >
            <SwitchCamera />
          </Button>

          <ToggledControl
            onToggle={elements.toggleCam}
            isToggled={elements.isCameraOn}
            toggledColor="white"
            unToggledColor="secondary"
            toggledTooltip="Turn camera off"
            unToggledTooltip="Camera off"
            toggledIcon={<Camera />}
            unToggledIcon={<CameraOff />}
          />
        </div>
      </div>
    </div>
  );
}
