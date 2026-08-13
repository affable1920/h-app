import { useLoaderData } from "react-router-dom";
import drImg from "@/assets/doctor.webp";
import {
  type ToggledControlProps,
  ToggledControl,
} from "@/features/call/components/VideoControl";
import {
  VolumeOff,
  Volume2,
  PhoneMissed,
  SwitchCamera,
  CameraOff,
  MicOff,
  Mic,
  Camera,
} from "lucide-react";
import { motion } from "motion/react";
import Button from "@components/ui/Button";
import { IdleView } from "@/features/call/components/IdleView";
import { useCall } from "@/features/call/core/use-call";
import Spinner from "@/components/ui/Spinner";
import type { Doctor } from "@/types/http";
import { useEffect, useRef } from "react";

export function TalkOverVideo() {
  const doctor = useLoaderData<Doctor>();
  const { callPeer, callState, ...elements } = useCall();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(
    function () {
      const el = localVideoRef.current;
      const rEl = remoteVideoRef.current;

      if (el) {
        el.srcObject = elements.local!;
      }

      if (rEl) {
        rEl.srcObject = elements.remote!;
      }
    },
    [elements.local, elements.remote],
  );

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
      onToggle: function () {
        elements.toggleSpeaker(remoteVideoRef.current!);
      },
      toggledColor: "secondary",
      unToggledColor: "white",
      toggledIcon: <VolumeOff />,
      unToggledIcon: <Volume2 />,
      toggledTooltip: "Speaker muted",
      unToggledTooltip: "Mute speaker",
    },
  ];

  function hangup() {
    const el = localVideoRef.current as HTMLVideoElement;
    el.srcObject = null;

    const rEl = remoteVideoRef.current as HTMLVideoElement;
    rEl.srcObject = null;

    elements.endCall();
  }

  return (
    <section className="h-screen max-h-[calc(100vh-12rem)] my-12">
      {callState === "idle" || callState === "ringing-incoming" ? (
        <IdleView
          drImg={drImg}
          drName={doctor?.name!}
          startCall={function () {
            callPeer("790e47de-7d44-407e-834e-2654393c5fba");
          }}
        />
      ) : callState === "ringing-outgoing" ? (
        <div
          className="max-w-fit mx-auto overflow-x-hidden gap-1 flex flex-col
h-[calc(100vh-40rem)] justify-center"
        >
          <p className="text-lg text-text">
            Calling Dr {doctor?.name.split(" ")[0]}
          </p>
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
      ) : (
        <div
          className="group/remote relative w-full h-full rounded-md ring-8 ring-indicator/10 overflow-hidden 
      shadow-lg shadow-black/20"
        >
          {/* Remote stream */}
          <div className="w-full h-full">
            <video
              ref={remoteVideoRef}
              className="w-full h-full object-cover"
              autoPlay
            />
            <Spinner loading={callState === "connecting"} />
          </div>

          <motion.div
            className="flex items-center gap-4 absolute bottom-4 left-1/2 -translate-x-1/2
            [&>*]:rounded-full opacity-0 translate-y-2 transition-all duration-300 ease-in-out
            group-hover/remote:opacity-100 group-hover/remote:translate-y-0"
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

          {/* local stream */}
          <div
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
              className="flex items-center gap-2 [&>*]:rounded-full absolute bottom-2 left-1/2
                  -translate-x-1/2 opacity-0 translate-y-2 transition-all duration-300 ease-in-out
                  group-hover/local:opacity-100 group-hover/local:translate-y-0"
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
      )}
    </section>
  );
}
