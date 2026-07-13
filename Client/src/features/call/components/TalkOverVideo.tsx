import { useLocation } from "react-router-dom";
import { useGetById } from "@/hooks/use-doctors";
import drImg from "@/assets/doctor.jpg";
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
import { useVideo } from "@/features/call/core/use-video";
import Spinner from "@components/ui/Spinner";
import { CallContext } from "./CallProvider";
import { useContext } from "react";

function TalkOverVideo() {
  const doctorId = useLocation().pathname.split("/").at(-2);
  const { data: doctor } = useGetById(doctorId as string);

  const { endCall, localVideoRef, remoteVideoRef, ...elements } = useVideo();

  const session = useContext(CallContext);

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

  return (
    <section className="h-screen max-h-[calc(100vh-12rem)] mt-4">
      {elements.isConnecting ? (
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
            {!elements.isConnected && (
              <span className="size-full inline-flex items-center justify-center">
                <Spinner loading={!elements.isConnected} />
              </span>
            )}
          </div>

          <motion.div
            className="flex items-center gap-4 absolute bottom-4 left-1/2 -translate-x-1/2
            [&>*]:rounded-full opacity-0 translate-y-2 transition-all duration-300 ease-in-out
            group-hover/remote:opacity-100 group-hover/remote:translate-y-0"
          >
            {controls.map((control, i) => (
              <ToggledControl key={i} {...control} />
            ))}
            <Button
              data-tooltip="End call"
              variant="icon"
              bg={true}
              color="danger"
              className="text-text-secondary"
              onClick={endCall}
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
            <div className="w-full h-full relative">
              <video
                className="h-full w-full object-cover"
                muted
                autoPlay
                playsInline
                ref={localVideoRef}
              />
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
                  onClick={elements.invertCamera}
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
        </div>
      ) : (
        <IdleView
          drName={doctor?.name!}
          drImg={drImg}
          startCall={function () {
            session?.sendOutgoing("7cb8510c-d24b-460f-b92c-0971cb74e173");
          }}
        />
      )}
    </section>
  );
}

export default TalkOverVideo;
