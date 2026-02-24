import { useCallback, useEffect, useRef } from "react";

import drImg from "@/assets/doctor.jpg";

import rtc from "@/services/RTCManager";
import Button from "@components/common/Button";
import { Video, AudioLines, MessageSquareText } from "lucide-react";
import { useGetById } from "@/hooks/doctors";
import { useLocation } from "react-router-dom";

const icons = [
  {
    icon: MessageSquareText,
    onClick() {},
  },
  {
    icon: AudioLines,
    onClick() {},
  },
  {
    icon: Video,
    onClick() {
      rtc.start();
    },
  },
];

const Consultation = () => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const callbacks = useCallback(
    function () {
      function onLocalStream(stream: MediaStream) {
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      }

      function onRemoteStream(stream: MediaStream) {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream;
        }
      }

      return { onLocalStream, onRemoteStream };
    },
    [localVideoRef.current, remoteVideoRef.current],
  );

  useEffect(() => {
    rtc.connect(callbacks);

    return () => rtc.unsubscribe();
  }, [callbacks]);

  const id = useLocation().pathname.split("/").at(-2);

  if (!id) {
    return null;
  }

  const { data: dr } = useGetById(id);

  return (
    <>
      <div className="flex flex-col items-center gap-4 p-4">
        <div className="max-w-20 bg-slate-200/40 rounded-full">
          <img
            src={drImg}
            alt="doc image"
            className="w-full mix-blend-multiply"
          />
        </div>
        <div>
          <h2 className="capitalize text-sm">Dr. {dr?.fullname}</h2>
        </div>

        <div>
          {dr?.status === "in_patient" ? (
            <h2>on call</h2>
          ) : (
            <div className="flex items-center gap-4">
              {icons.map((i, id) => (
                <Button key={id} onClick={i.onClick} variant="ghost">
                  <i.icon />
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-12">
        <div>
          <video
            ref={localVideoRef}
            autoPlay
            muted
            style={{ width: "300px" }}
          />
        </div>

        <div>
          <video ref={remoteVideoRef} autoPlay style={{ width: "300px" }} />
        </div>
      </div>
    </>
  );
};

export default Consultation;
