import { useEffect, useRef } from "react";

import drImg from "@/assets/doctor.jpg";
import type { Doctor } from "@/types/http";

import Button from "@components/common/Button";
import connectionClient from "@/services/ConnManager";
import { Video, AudioLines, MessageSquareText } from "lucide-react";

const Consultation = ({ dr }: { dr: Doctor }) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }

      connectionClient.close();
    };
  }, []);

  // Step 1: Access your media devices
  const startVideo = async () => {
    if (navigator.userAgent.toLowerCase().includes("android")) {
      console.log("an android device is trying to connect ...");
      console.log(navigator.mediaCapabilities);
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        frameRate: 30,
        width: 1280,
        height: 720,
      },

      audio: {
        width: 1280,
        height: 720,
        frameRate: 30,
      },
    });

    localStreamRef.current = stream;

    console.log("starting video");
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
  };

  // Step 2: initiate the webRTC conn and add tracks to it
  // Step 3: Handle the SDP - the offer and answer exchange
  async function initiateExchange() {
    const pc = connectionClient.RTC as RTCPeerConnection;

    const offer = await pc.createOffer();
    console.log("offer creation rqst recieved. \ncreated offer: ", offer);

    await pc.setLocalDescription(offer);

    const offerObject = {
      to: dr.id,
      type: "offer",
      offer,
    };

    connectionClient.sendMsg(offerObject);
    console.log("offer sent successfully ...");
  }

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
      async onClick() {
        startVideo().then(async () => {
          const stream = localStreamRef.current;

          if (stream) {
            connectionClient.initiatePeerConnection(stream.getTracks(), stream);
            await initiateExchange();
          }
        });
      },
    },
  ];

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
          <h2 className="capitalize text-sm">Dr. {dr.fullname}</h2>
        </div>

        <div>
          {dr.status === "in_patient" ? (
            <h2>on call</h2>
          ) : (
            <div className="flex items-center gap-4">
              {icons.map((i, id) => (
                <Button
                  key={id}
                  onClick={i.onClick.bind(i)}
                  variant="icon"
                  size="xs"
                >
                  <i.icon />
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div>
        <video ref={localVideoRef} autoPlay muted style={{ width: "300px" }} />
      </div>

      <div>
        <video ref={remoteVideoRef} autoPlay style={{ width: "300px" }} />
      </div>
    </>
  );
};

export default Consultation;
