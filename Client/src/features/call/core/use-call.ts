import { useContext, useEffect, useState } from "react";
import { CallContext } from "../components/CallProvider";
import type { CallSessionState } from "../types";

export function useCall() {
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);

  const callSession = useContext(CallContext);
  const [callState, setCallState] = useState<CallSessionState>(
    callSession?.state ?? "idle",
  );

  useEffect(
    function () {
      if (!callSession) {
        return;
      }

      function handleStateChange(ev: CustomEvent<CallSessionState>) {
        setCallState(ev.detail);
      }

      callSession.on("state-change", handleStateChange);

      return function () {
        callSession.off("state-change", handleStateChange);
      };
    },
    [callSession],
  );

  function toggleMic() {
    const localAudio = callSession?.audio;

    if (!localAudio) {
      return;
    }

    setIsMicMuted(function (prev) {
      const next = !prev;
      // mic enabled and mic muted are anonymous
      localAudio.enabled = !next;
      return next;
    });
  }

  function toggleSpeaker(el: HTMLVideoElement) {
    setIsSpeakerMuted(function (prev) {
      const next = !prev;
      el.muted = next;
      return next;
    });
  }

  function invertCamera(el: HTMLVideoElement) {
    el.style.scale = el.style.scale === "-1 1" ? "1 1" : "-1 1";
  }

  function toggleCam() {
    const localVideo = callSession?.video;

    if (!localVideo) {
      return;
    }

    setIsCameraOn(function (prev) {
      const next = !prev;
      localVideo.enabled = next;
      return next;
    });
  }

  function endCall() {
    callSession?.endOngoingCall();
  }

  function callPeer(peerId: string) {
    console.log("calling peer with id ", peerId);
    callSession?.sendOutgoing(peerId);
  }

  const publicApi = {
    callPeer,
    isCameraOn,
    toggleMic,
    toggleSpeaker,
    toggleCam,
    endCall,
    isMicMuted,
    isSpeakerMuted,
    invertCamera,
    callState,
    local: callSession?.local,
    remote: callSession?.remote,
  };

  return publicApi;
}
