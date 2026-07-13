import { useContext, useEffect, useRef, useState } from "react";
import { CallContext } from "../components/CallProvider";
import type { CallSessionState } from "../types/types";

export function useVideo() {
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);

  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);

  const callSession = useContext(CallContext);
  const [callState, setCallState] = useState(callSession?.state ?? "idle");

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(
    function () {
      if (!callSession) {
        return;
      }

      const { onLocalStream, onRemoteStream } = startListening();

      function handleStateChange({
        detail: val,
      }: CustomEvent<CallSessionState>) {
        const eventType = val;
        setCallState(eventType);

        if (
          eventType === "ringing-incoming" ||
          eventType === "ringing-outgoing"
        ) {
          setIsConnecting(true);
        }
      }

      function handleRemoteHangup() {
        endCall();
      }

      callSession.on("state-change", handleStateChange);
      callSession.on("peer-hungup", handleRemoteHangup);

      return function () {
        callSession.off("peer-hungup", handleRemoteHangup);
        callSession.off("state-change", handleStateChange);
        callSession.off("local-stream", onLocalStream);
        callSession.off("remote-stream", onRemoteStream);
      };
    },
    [callSession],
  );

  function startListening() {
    function onLocalStream(ev: CustomEvent) {
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = ev.detail as MediaStream;
      } else {
        console.log(
          "[use-video.local-stream] No local video element found ...",
        );
      }
    }

    function onRemoteStream(ev: CustomEvent) {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = ev.detail.stream as MediaStream;
      } else {
        console.log("[use-video.remote-stream] No remote video element found");
      }
    }

    callSession?.on("local-stream", onLocalStream);
    callSession?.on("remote-stream", onRemoteStream);

    return {
      onLocalStream,
      onRemoteStream,
    };
  }

  function toggleMic() {
    const localAudio = callSession?.audio;

    if (!localAudio) {
      // Return early given there's no local stream - no call initiated yet.
      return;
    }

    setIsMicMuted(function (prev) {
      const next = !prev;

      // mic enabled and mic muted are anonymous
      localAudio.enabled = !next;
      return next;
    });
  }

  function toggleSpeaker() {
    const el = remoteVideoRef.current;

    if (!el) {
      return;
    }

    setIsSpeakerMuted(function (prev) {
      const next = !prev;
      el.muted = next;
      return next;
    });
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

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    setIsConnected(false);
    setIsConnecting(false);
  }

  function invertCamera() {
    const el = localVideoRef.current;

    if (!el) {
      return;
    }

    el.style.scale = el.style.scale === "-1 1" ? "1 1" : "-1 1";
  }

  const publicApi = {
    isConnected,
    isCameraOn,
    isConnecting,
    toggleMic,
    toggleSpeaker,
    toggleCam,
    endCall,
    isMicMuted,
    isSpeakerMuted,
    invertCamera,
    localVideoRef,
    remoteVideoRef,
  };

  return publicApi;
}
