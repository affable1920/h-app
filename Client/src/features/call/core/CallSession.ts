import { type ExternalToast, toast } from "sonner";
import { WebRTC } from "./WebRTC";
import EventEmitter from "./EventEmitter";
import type { CallSessionEvents, CallSessionState } from "../types";
import router from "@/components/router";

/**
 * The intention for this class's implementation is to make it represent an ongoing call session from both -
 * the caller and callee's POV. Instead of injecting callbacks,
 * consumers subscribe to named events - local-stream, remote-stream, ice-state-change, track-ended, etc.
 *
 * - Should act as a state machine specifying the step the RTC client is currently at
 *   e,g idle -> ringing-outgoing / ringing-incoming -> connecting -> connected -> ended
 *
 * - Must be entirely event driven. An incoming offer could be translated as driving the state machine from idle to
 *   ringing-incoming exactly the way calling "call()" would drive it to ringing-incoming.
 *
 * - Own the WebRTC instance and the logic to create/accept offers.
 *
 * - Becomes a producer for our use-video hook which derives all its booleans, state variables from here.
 *
 * --- Afterwards, use-video hook becomes a thin react adapter: susnscribes to CallSession events and mirrors them
 *     into state for rendering.
 *
 * --- Benefit - Much easier to reason about going forward as new calling capabilities are added to the call session
 *     itself, not threaded through the hook's internals.
 */

export default class CallSession extends EventEmitter<CallSessionEvents> {
  private client: WebRTC;
  #state: CallSessionState = "idle";
  #controller = new AbortController();

  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private readonly localUser: { id: string; token: string };

  constructor({ id, token }: { id: string; token: string }) {
    console.log("Call session instance created .");

    super();
    this.localUser = {
      id,
      token,
    };

    this.client = new WebRTC();
    this.listen();
  }

  listen() {
    // understanding events and their lifetime
    /** incoming-offer - must always have a listener
     *  hang-up/peer-hangup - for the duration of a call
     *  remote-stream       - same ..
     *  offer-accept        - ..
     *  offer-decline       - ..
     */

    this.client.on("incoming-offer", this.onIncoming);
  }

  private listenForPerCallEvents() {
    this.client.on("hang-up", this.endOngoingCall);
    this.client.on("remote-stream", this.saveRemoteStream);
    this.client.on("offer-accept", this.onPeerAccept);
    this.client.on("offer-decline", this.onPeerDecline);
  }

  private stoplisteningForPerCallEvents() {
    this.client.off("hang-up", this.endOngoingCall);
    this.client.off("remote-stream", this.saveRemoteStream);
    this.client.off("offer-accept", this.onPeerAccept);
    this.client.off("offer-decline", this.onPeerDecline);
  }

  get state() {
    return this.#state;
  }

  get audio() {
    return this.localStream?.getAudioTracks()[0];
  }

  get video() {
    return this.localStream?.getVideoTracks()[0];
  }

  get local() {
    return this.localStream;
  }

  get remote() {
    return this.remoteStream;
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
    this.remoteStream = stream;
    this.emit("remote-stream", stream);
    this.#setState("connected");
  }

  private async acceptIncoming(ev: CustomEvent, peerId: string) {
    this.#setState("connecting");
    await router.navigate(`/view/doctor/${peerId}/consult`, {
      replace: true, // set replace to true, so on an accidental back press, nothing happens
    });
    this.client.connect(this.localUser);
    await this.acquireMedia();
    this.emit("local-stream", this.localStream!);
    await this.client.createAnswer(ev, peerId);
  }

  private declineIncoming(ev: CustomEvent, peerId: string) {
    ev.preventDefault();
    this.client.declineCall(this.localUser.id, peerId);
    toast.dismiss();
    this.#setState("idle");
  }

  private onIncoming(ev: CustomEvent) {
    this.#setState("ringing-incoming");

    const { metadata = {} } = ev.detail;
    const peer = metadata?.from ?? null;

    this.notify(peer + " wants to connect with you.", {
      action: {
        label: "Accept",
        onClick: this.acceptIncoming.bind(this, ev, peer),
      },
      cancel: {
        label: "Decline",
        onClick: this.declineIncoming.bind(this, ev, peer),
      },
      duration: 5000,
    });
  }

  onPeerAccept() {
    this.#setState("connecting");
    this.emit("local-stream", this.localStream!);
  }

  onPeerDecline(ev: CustomEvent) {
    ev.preventDefault();
    this.#setState("idle");
    this.client.disconnect("offer-decline");
    this.notify("Connection request declined by peer!");
  }

  private cleanup() {
    this.localStream = null;
    this.remoteStream = null;
  }

  endOngoingCall() {
    this.localStream?.getTracks().forEach(function (track) {
      track.stop();
    });

    this.remoteStream?.getTracks().forEach(function (track) {
      track.stop();
    });

    this.client.disconnect("hang-up");
    this.client.cleanup();
    this.#setState("idle");
    this.cleanup();
  }

  async acquireMedia() {
    const log = this.getLogger("AcquireMedia");
    log("About to acquire media ....");

    const media = navigator.mediaDevices;
    const stream = await media.getUserMedia({
      audio: true,
      video: true,
    });

    this.localStream = stream;
    this.client.addTracks(stream);

    log(
      "Media acquired, local stream saved inside the class, and added tracks to the RTC client instance.",
    );
  }

  async sendOutgoing(peerId: string) {
    this.#setState("ringing-outgoing");
    this.client.connect(this.localUser);
    await this.acquireMedia();
    await this.client.start(peerId);
  }
}
