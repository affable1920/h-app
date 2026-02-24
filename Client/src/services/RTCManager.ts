import useAuthStore from "@/stores/authStore";
import signalingClient from "./SignalingClient";
import { toast } from "sonner";

type StreamCallback = (stream: MediaStream) => void;
enum ConnectionState {
  IDLE, // nothing exists yet
  RTC_CREATED, // RTCPeer created
  MEDIA_ACQUIRED, // mic/camera ready
  OFFER_SENT,
  ANSWER_RECIEVED,
  CONNECTED,
  DISCONNECTED,
}

const config = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

class RTCManager {
  private _rtc: RTCPeerConnection | null = null;

  localStream: MediaStream | null = null;
  videoTrack: MediaStreamTrack | null = null;
  audioTrack: MediaStreamTrack | null = null;

  remoteStream: MediaStream | null = null;

  // private state: ConnectionState = ConnectionState.IDLE;
  private iceCandidateBuffer: Array<RTCIceCandidate> = [];

  private onLocalStream: StreamCallback | null = null;
  private onRemoteStream: StreamCallback | null = null;

  private get rtc(): RTCPeerConnection {
    if (!this._rtc) {
      throw new Error("RTC not initialized");
    }

    return this._rtc;
  }

  get isConnected() {
    return this._rtc?.connectionState === "connected";
  }

  reconnectSignaling() {
    if (!signalingClient.isConnected) {
      const token = useAuthStore.getState().token;

      if (!token) {
        const msg =
          "You must be logged in before using any of these features 1";
        toast.error(msg);
        return;
        // throw new Error(msg);
      }

      signalingClient.connect(token);
    }
  }

  connect(
    callbacks: () => {
      onLocalStream: StreamCallback;
      onRemoteStream: StreamCallback;
    },
  ) {
    if (this.isConnected) {
      return;
    }

    this._rtc = new RTCPeerConnection(config);

    this.reconnectSignaling();

    this.setupRTCListeners();
    this.setupWsListeners();

    const { onLocalStream, onRemoteStream } = callbacks();

    this.onLocalStream = onLocalStream;
    this.onRemoteStream = onRemoteStream;
  }

  private setupRTCListeners() {
    this.rtc.onconnectionstatechange = () => {
      const state = this.rtc.connectionState;

      switch (state) {
        case "connected":
          console.log("RTC CONNECTED");
          break;

        case "connecting":
          console.log("RTC CONNECTING");
          break;

        case "failed":
          // failed means connection is actually dead;
          console.log("RTC CONNECTION FAILED");
          break;

        case "disconnected":
          // disconnected does not mean connection is actually dead, might go there;
          // right now might be a temporary hiccup, it will auto retry and on failure move to failed state
          console.log("RTC DISCONNECTED");
          break;
      }
    };

    this.rtc.ontrack = (ev) => {
      console.info("\nRemote tracks recieved. Adding to remote stream.");

      this.remoteStream = ev.streams[0];
      this.onRemoteStream?.(ev.streams[0]);
    };

    this.rtc.onicecandidate = (ev) => {
      if (ev.candidate) {
        signalingClient.send("ice-candidate", {
          payload: ev.candidate,
          metadata: { to: "8f1351d8-9e3d-495d-a481-fe71107ee3af" },
        });
      }
    };
  }

  flushIceCandidates = async () => {
    for (const candidate of this.iceCandidateBuffer) {
      await (this.rtc as RTCPeerConnection).addIceCandidate(candidate);
    }

    this.iceCandidateBuffer = [];
  };

  private setupWsListeners() {
    signalingClient.on("offline", this.onOffline);
    signalingClient.on("offer", this.onOffer);
    signalingClient.on("answer", this.onAnswer);
    signalingClient.on("ice-candidate", this.onIceCandidate);
  }

  private unsetWsListeners() {
    signalingClient.on("offer", this.onOffer);
    signalingClient.off("offline", this.onOffline);
    signalingClient.off("answer", this.onAnswer);
    signalingClient.off("ice-candidate", this.onIceCandidate);
  }

  async acquireMedia() {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });

    this.localStream = stream;
    this.onLocalStream?.(stream);

    this.audioTrack = stream.getAudioTracks()[0];
    this.videoTrack = stream.getVideoTracks()[0];

    stream.getTracks().forEach((track) => this.rtc.addTrack(track, stream));
  }

  async createOffer() {
    const offer = await this.rtc.createOffer();

    await this.rtc.setLocalDescription(offer);
    signalingClient.send("offer", {
      payload: offer,
      metadata: { to: "8f1351d8-9e3d-495d-a481-fe71107ee3af" },
    });
  }

  onAnswer = async (ev: CustomEvent) => {
    console.log("\nAnswer recived. Inside handle answer callback.");

    await this.rtc.setRemoteDescription(ev.detail);
    await this.flushIceCandidates();
  };

  onOffer = async (ev: CustomEvent) => {
    console.log(
      "\nOffer recieved. Handle offer called. Event logged below ->\n",
    );
    console.log(ev);

    await this.acquireMedia();
    await this.rtc.setRemoteDescription(ev.detail);

    await this.flushIceCandidates();

    const answer = await this.rtc.createAnswer();
    await this.rtc.setLocalDescription(answer);

    signalingClient.send("answer", {
      payload: answer,
      metadata: { to: "8f1351d8-9e3d-495d-a481-fe71107ee3af" },
    });
  };

  onIceCandidate = async (ev: CustomEvent) => {
    const candidate = ev.detail;

    if (this.rtc.remoteDescription?.type) {
      console.log("\nFound remote desc to be set, adding ice candidates ..");
      this.rtc.addIceCandidate(candidate);
    } else {
      this.iceCandidateBuffer.push(candidate);
    }
  };

  onOffline(ev: CustomEvent) {
    console.log("\nInside offline handler");
    toast.error(ev.detail);
  }

  async start() {
    await this.acquireMedia();
    await this.createOffer();
  }

  private baseSetAll = () => {
    this._rtc = null;
    this.localStream = null;
    this.remoteStream = null;
    this.audioTrack = null;
    this.videoTrack = null;
    this.iceCandidateBuffer = [];
  };

  unsubscribe = () => {
    this.localStream?.getTracks().forEach((track) => track.stop());

    this.localStream = null;
    this.remoteStream = null;
  };

  disconnect() {
    console.log("\nDisconnect called on RTC, \nDisconnecting ...");

    this.localStream?.getTracks().forEach((track) => track.stop());
    this.rtc.close();

    this.unsetWsListeners();
    this.baseSetAll();
  }
}

const rtc = new RTCManager();
export default rtc;
