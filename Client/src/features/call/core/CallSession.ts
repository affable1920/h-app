import { type ExternalToast, toast } from "sonner";
import { router } from "@/routing/app-router";
import { WebRTC } from "./WebRTC";
import EventEmitter from "./EventEmitter";
import type { ServerMessageFor } from "../contract/schema";
import type { CallSessionEvents, CallSessionState } from "../contract/types";

export default class CallSession extends EventEmitter<CallSessionEvents> {
  private client: WebRTC;

  #state: CallSessionState = "idle";
  #localStream: MediaStream | null = null;
  #remoteStream: MediaStream | null = null;

  private appointmentId: string | null = null;
  private readonly localUser: { id: string; token: string };

  constructor({ id, token }: { id: string; token: string }) {
    super();
    this.localUser = {
      id,
      token,
    };

    this.client = new WebRTC();
    this.listen();
  }

  listen() {
    this.client.on("incoming-offer", this.onIncoming);
  }

  private listenForPerCallEvents() {
    this.client.on("hang-up", this.onPeerHangup);
    this.client.on("remote-stream", this.saveRemoteStream);
    this.client.on("answer", this.onPeerAccept);
    this.client.on("offer-decline", this.onPeerDecline);
    this.client.on("call-timeout", this.onOutgoingTimeout);
  }

  private stoplisteningForPerCallEvents() {
    this.client.off("hang-up", this.onPeerHangup);
    this.client.off("remote-stream", this.saveRemoteStream);
    this.client.off("answer", this.onPeerAccept);
    this.client.off("offer-decline", this.onPeerDecline);
    this.client.off("call-timeout", this.onOutgoingTimeout);
    this.client.off("call-confirmation", this.sendOutgoing);
  }

  get state(): CallSessionState {
    return this.#state;
  }

  get localAudioTrack(): MediaStreamTrack | null {
    return this.#localStream?.getAudioTracks()[0] ?? null;
  }

  get localVideoTrack(): MediaStreamTrack | null {
    return this.#localStream?.getVideoTracks()[0] ?? null;
  }

  get localStream(): MediaStream | null {
    return this.#localStream;
  }

  get remoteStream(): MediaStream | null {
    return this.#remoteStream;
  }

  #setState(next: CallSessionState) {
    const lg = this.getLogger("CallSession.setState");

    lg(`State machine moving from ${this.state} to ${next}`);

    if (next !== "idle") {
      this.listenForPerCallEvents();
    } else {
      this.stoplisteningForPerCallEvents();
    }

    this.#state = next;
    this.emit("state-change", next);
  }

  private notify(message: string, data?: ExternalToast): string | number {
    return toast(message, {
      ...data,
    });
  }

  private async saveRemoteStream(ev: CustomEvent<MediaStream>) {
    const stream = ev.detail;
    this.#remoteStream = stream;
    this.emit("remote-stream", stream);
    this.#setState("connected");
  }

  private closeTracks() {
    if (this.#localStream) {
      this.#localStream.getTracks().forEach(function (track) {
        track.stop();
      });

      this.#localStream = null;
    }

    if (this.#remoteStream) {
      this.#remoteStream.getTracks().forEach(function (track) {
        track.stop();
      });

      this.#remoteStream = null;
    }
  }

  private onOutgoingTimeout(ev: CustomEvent<ServerMessageFor<"timeout">>) {
    const { message } = ev.detail.payload;

    this.closeTracks();
    this.client.close();
    this.appointmentId = null;
    this.#setState("idle");

    this.notify("Request timed out.", {
      description: message,
      duration: 5_000,
    });
  }

  private onIncoming(ev: CustomEvent<ServerMessageFor<"offer">>) {
    this.#setState("ringing-incoming");

    const { metadata } = ev.detail;
    this.appointmentId = metadata.appointmentId;

    this.notify(metadata.from + " wants to connect with you.", {
      action: {
        label: "Accept",
        onClick: this.acceptIncoming.bind(this, ev),
      },
      cancel: {
        label: "Decline",
        onClick: this.declineIncoming.bind(this, ev),
      },
      duration: 10_000,
    });
  }

  private async acceptIncoming(ev: CustomEvent<ServerMessageFor<"offer">>) {
    this.#setState("connecting");

    await router.navigate(`/app/consultation/${this.appointmentId}`, {
      replace: true,
    });

    await this.client.connect(this.localUser.token);
    await this.acquireMedia();

    this.emit("local-stream", this.#localStream!);
    await this.client.createAnswer(ev);
  }

  private declineIncoming(ev: CustomEvent) {
    ev.preventDefault();
    this.client.declineIncoming();

    this.#setState("idle");
    toast.dismiss();
  }

  async onPeerAccept() {
    await router.navigate(`/app/consultation/${this.appointmentId}`, {
      replace: true,
    });

    this.#setState("connecting");
    this.emit("local-stream", this.#localStream!);
  }

  onPeerDecline(ev: CustomEvent<ServerMessageFor<"offer-decline">>) {
    ev.preventDefault();

    const reason = ev.detail.payload.message;
    this.notify(reason ?? "Connection request declined by peer!");

    this.closeTracks();
    this.client.close();
    this.#setState("idle");
  }

  async acquireMedia() {
    const log = this.getLogger("AcquireMedia");
    log("About to acquire media ....");

    const media = navigator.mediaDevices;
    const stream = await media.getUserMedia({
      audio: true,
      video: true,
    });

    this.#localStream = stream;
    this.client.addTracks(stream);

    log(
      "Media acquired, local stream saved inside the class, and added tracks to the RTC client instance.",
    );
  }

  async sendOutgoing() {
    this.#setState("ringing-outgoing");
    await this.acquireMedia();
    await this.client.start();
  }

  async initiate(peerId: string, appointmentId: string) {
    this.appointmentId = appointmentId;
    this.client.on("call-confirmation", this.sendOutgoing);

    await this.client.connect(this.localUser.token);
    this.client.initiate(peerId, appointmentId);
  }

  onPeerHangup() {
    this.closeTracks();
    this.#setState("idle");

    this.client.close();
    this.notify("Your peer has hanged up.");
  }

  endOngoingCall() {
    this.closeTracks();
    this.client.hangup();

    this.#setState("idle");
    this.notify("Call ended.");
  }
}
