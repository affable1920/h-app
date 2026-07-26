import {
  type SignalingEvent,
  type SignalingEventMessage,
  type WebRTCEvents,
} from "../types";
import signalingClient from "@/features/call/core/SignalingClient";
import EventEmitter from "../core/EventEmitter";

const config = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export class WebRTC extends EventEmitter<WebRTCEvents> {
  /** - Web rtc event and the lifetime of their listeners
   * this client is also lazily initialized and is scoped per call, native events like ontrack, onice don't need
   * any manual removal, that automatically happens on rtc.close()
   */

  // delay rtc creation - create only on demand using the connect method
  private _rtc: RTCPeerConnection | null = null;

  private peerId: string | null = null;
  private localId: string | null = null;

  private iceCandidateBuffer: Array<RTCIceCandidateInit> = [];

  constructor() {
    super();
    this.listenOnSignaling();
  }

  private listenOnSignaling() {
    signalingClient.on("answer", this.onAnswer);
    signalingClient.on("ice-candidate", this.onIceCandidate);

    this.relay(signalingClient, "offer", "incoming-offer");
    this.relay(signalingClient, "offer-decline");
    this.relay(signalingClient, "offer-accpet");
    this.relay(signalingClient, "hang-up");
  }

  private get rtc() {
    return this._rtc;
  }

  private set rtc(val: RTCPeerConnection | null) {
    this._rtc = val;
  }

  get isCreated() {
    // use to clarify if the rtc connection is 100% setup and data between peers is actually flowing.
    if (!this.rtc) {
      return false;
    }

    return true;
  }

  private sendToPeer<K extends SignalingEvent>(
    msgType: K,
    payload?: SignalingEventMessage<K>["payload"],
  ) {
    const lg = this.getLogger("WebRTC.sendToPeer");
    if (!this.peerId) {
      lg(
        "No peerId specified yet. please specify the remote peer before sending a message.",
      );
    }

    signalingClient.send(msgType, {
      payload,
      metadata: {
        from: this.localId!,
        to: this.peerId!,
      },
    });
  }

  addTracks(stream: MediaStream) {
    function addTrack(this: WebRTC, track: MediaStreamTrack) {
      this.rtc?.addTrack(track, stream);
    }

    stream.getTracks().forEach(addTrack.bind(this));
  }

  connect({ token, id }: { id: string; token: string }) {
    if (!signalingClient.isConnected) {
      console.log(
        `[WebRTC.connect] SignalingClient not connected! Current state: ${signalingClient.connectionState}`,
        "Connecting to the signaling client.",
      );
      signalingClient.connect(token);
    }

    if (this.isCreated) {
      console.log(
        "[WebRTC.connect] WebRTC instance already created, Aborting creation ...",
      );
      return;
    }

    this._rtc = new RTCPeerConnection(config);
    this.localId = id;
    this._rtc.ontrack = this.onRemoteTrack;
    this._rtc.onicecandidate = this.onIce;
  }

  private onRemoteTrack(ev: RTCTrackEvent) {
    const stream = ev.streams[0];

    if (!stream) {
      console.log(
        "Remote track listener was fired without any remote stream present. Aborting ...",
        `event ->`,
        ev,
      );
      return;
    }

    this.emit("remote-stream", stream);
  }

  private onIce({ candidate }: RTCPeerConnectionIceEvent) {
    if (candidate) {
      this.sendToPeer("ice-candidate", candidate);
    } else {
      console.log("ice-candidate nullish, Ice gathering has likely completed.");
    }
  }

  async createOffer() {
    if (!this.rtc) {
      return;
    }

    const log = this.getLogger("createOffer");
    const sdp = await this.rtc?.createOffer();

    await this.rtc.setLocalDescription(sdp);

    this.sendToPeer("offer", sdp);
    log(
      "Offer created, set as local description and sent to remote peer via signalingClient.",
    );
  }

  async createAnswer(ev: CustomEvent, peerId: string) {
    this.peerId = peerId;
    const msg = ev.detail;
    await this.rtc?.setRemoteDescription(msg.payload);

    const answer = await this.rtc?.createAnswer();
    await this.rtc?.setLocalDescription(answer);

    this.sendToPeer("answer", answer);
  }

  private async onAnswer(ev: CustomEvent) {
    this.emit("offer-accept");

    const lg = this.getLogger("WebRTC.onAnswer");
    const msg = ev.detail;
    await this.rtc?.setRemoteDescription(msg.payload);

    lg(
      `Answer recieved, and set as remote description. flushing ice candidates ...`,
    );
    await this.flushIceCandidates();
  }

  private async flushIceCandidates() {
    for (const candidate of this.iceCandidateBuffer) {
      await this.rtc?.addIceCandidate(candidate);
    }

    this.iceCandidateBuffer = [];
  }

  private async onIceCandidate(ev: CustomEvent) {
    // ice candidates can start ticking even before recieving an answer,
    // save them till then
    const lg = this.getLogger("onIceCandidate");

    const candidate = ev.detail.payload;

    if (candidate && this.rtc?.remoteDescription?.type) {
      lg("answer already set, adding ice-candidates to peer conenction ...");

      await this.rtc.addIceCandidate(candidate);
    } else if (candidate) {
      lg("answer yet to be recieved, saving candidates to the buffer for now.");
      this.iceCandidateBuffer.push(candidate);
    }
  }

  async start(peerId: string) {
    this.peerId = peerId;
    await this.createOffer();
  }

  disconnect(reason: keyof WebRTCEvents = "hang-up") {
    this.sendToPeer(reason);

    if (this.rtc) {
      this.rtc?.close();
      this.rtc = null;
    }

    this.stoplisteningOnSignaling();
    this.localId = null;
    this.peerId = null;
    this.iceCandidateBuffer = [];
  }

  private stoplisteningOnSignaling() {
    signalingClient.off("answer", this.onAnswer);
    signalingClient.off("ice-candidate", this.onIceCandidate);
  }

  declineCall(localId: string, peerId: string) {
    this.localId = localId;
    this.peerId = peerId;
    this.sendToPeer("offer-decline");
  }

  cleanup() {}
}
