import { type WebRTCEvents } from "../contract/types";
import signalingClient from "@/features/call/core/SignalingClient";
import EventEmitter from "../core/EventEmitter";
import type { ClientMessageBody, ServerMessageFor } from "../contract/schema";

const config = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export class WebRTC extends EventEmitter<WebRTCEvents> {
  private _rtc: RTCPeerConnection | null = null;

  private peerId: string | null = null;
  private appointmentId: string | null = null;

  private iceCandidateBuffer: Array<RTCIceCandidateInit> = [];

  constructor() {
    super();
    this.listenOnSignaling();
  }

  private listenOnSignaling() {
    signalingClient.on("answer", this.onAnswer);
    signalingClient.on("ice-candidate", this.onIceCandidate);
    signalingClient.on("offer", this.onIncoming);

    this.relay(signalingClient, "offer-decline");
    this.relay(signalingClient, "hang-up");
    this.relay(signalingClient, "error");

    this.relay(signalingClient, "confirmation", "call-confirmation");
    this.relay(signalingClient, "offline", "peer-offline");
    this.relay(signalingClient, "timeout", "call-timeout");
  }

  private get rtc() {
    return this._rtc;
  }

  private set rtc(val: RTCPeerConnection | null) {
    this._rtc = val;
  }

  get isCreated() {
    if (this.rtc === null) {
      return false;
    }

    return true;
  }

  private sendToPeer(message: ClientMessageBody) {
    const lg = this.getLogger("WebRTC.sendToPeer");

    if (!this.peerId || !this.appointmentId) {
      lg("Cannot send: peer or appointment context missing.");
      return;
    }

    signalingClient.send({
      ...message,
      metadata: {
        to: this.peerId,
        appointmentId: this.appointmentId,
      },
    });
  }

  private onIncoming(ev: CustomEvent<ServerMessageFor<"offer">>) {
    const { metadata } = ev.detail;

    this.peerId = metadata.from;
    this.appointmentId = metadata.appointmentId;

    this.emit("incoming-offer", ev.detail);
  }

  addTracks(stream: MediaStream) {
    function addTrack(this: WebRTC, track: MediaStreamTrack) {
      this.rtc?.addTrack(track, stream);
    }

    stream.getTracks().forEach(addTrack.bind(this));
  }

  private async flushIceCandidates() {
    for (const candidate of this.iceCandidateBuffer) {
      await this.rtc?.addIceCandidate(candidate);
    }

    this.iceCandidateBuffer = [];
  }

  connect(token: string) {
    if (!signalingClient.isConnected) {
      console.log(
        `[WebRTC.connect] SignalingClient not connected! Current state: ${signalingClient._readyState}`,
        "Connecting to the signaling client.",
      );

      signalingClient.connect(token);
    }

    if (!this.isCreated) {
      this._rtc = new RTCPeerConnection(config);
      this._rtc.ontrack = this.onRemoteTrack;
      this._rtc.onicecandidate = this.onIce;
    }
  }

  private onRemoteTrack(ev: RTCTrackEvent) {
    const stream = ev.streams[0];

    if (!stream) {
      console.log(
        "Remote track listener was fired without any remote stream present. Aborting ...",
      );

      return;
    }

    this.emit("remote-stream", stream);
  }

  private onIce({ candidate }: RTCPeerConnectionIceEvent) {
    if (candidate) {
      this.sendToPeer({
        msgType: "ice-candidate",
        payload: candidate,
      });
    } else {
      console.log("ice-candidate nullish, Ice gathering has likely completed.");
    }
  }

  async createOffer() {
    if (!this.rtc) {
      return;
    }

    const log = this.getLogger("createOffer");
    const sdp = await this.rtc.createOffer();

    await this.rtc.setLocalDescription(sdp);
    this.sendToPeer({
      msgType: "offer",
      payload: sdp,
    });

    log(
      "Offer created, set as local description and sent to remote peer via signalingClient..",
    );
  }

  async createAnswer(ev: CustomEvent<ServerMessageFor<"offer">>) {
    const { payload, metadata } = ev.detail;

    this.peerId = metadata.from;
    this.appointmentId = metadata.appointmentId;

    await this.rtc?.setRemoteDescription(payload);

    const answer = await this.rtc?.createAnswer();
    await this.rtc?.setLocalDescription(answer);

    if (answer) {
      this.sendToPeer({
        msgType: "answer",
        payload: answer,
      });
    }
  }

  private async onAnswer(ev: CustomEvent<ServerMessageFor<"answer">>) {
    this.emit("answer", ev.detail);

    const lg = this.getLogger("WebRTC.onAnswer");

    const msg = ev.detail;
    await this.rtc?.setRemoteDescription(msg.payload);

    lg(
      `Answer recieved, and set as remote description. flushing ice candidates ...`,
    );

    await this.flushIceCandidates();
  }

  private async onIceCandidate(
    ev: CustomEvent<ServerMessageFor<"ice-candidate">>,
  ) {
    const lg = this.getLogger("onIceCandidate");

    const candidate = ev.detail.payload;

    if (candidate && this.rtc?.remoteDescription?.type) {
      lg("answer already set, adding ice-candidates to RTC client..");

      await this.rtc.addIceCandidate(candidate);
    } else if (candidate) {
      lg("answer yet to be recieved, saving candidates to the buffer for now.");
      this.iceCandidateBuffer.push(candidate);
    }
  }

  async start() {
    await this.createOffer();
  }

  initiate(peerId: string, appointmentId: string) {
    this.peerId = peerId;
    this.appointmentId = appointmentId;

    this.sendToPeer({
      msgType: "init",
    });
  }

  declineIncoming() {
    this.sendToPeer({
      msgType: "offer-decline",
    });

    this.close();
  }

  hangup() {
    this.sendToPeer({
      msgType: "hang-up",
    });

    this.close();
  }

  close() {
    if (this.rtc) {
      this.rtc.close();
      this.rtc = null;
    }

    this.iceCandidateBuffer = [];

    this.peerId = null;
    this.appointmentId = null;
  }
}
