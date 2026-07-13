import { type ExternalToast, toast } from "sonner";
import { WebRTC } from "./WebRTC";
import EventEmitter from "./EventEmitter";

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

export default class CallSession extends EventEmitter {
  private client: WebRTC;
  #state = "idle";
  #controller = new AbortController();

  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;

  private readonly localUser: { id: string; token: string };
  // private handleIncoming = this.onIncoming.bind(this);

  constructor({ id, token }: { id: string; token: string }) {
    super();
    this.localUser = {
      id,
      token,
    };

    this.client = new WebRTC();

    this.client.on("remote-stream", this.saveRemoteStream, {
      signal: this.#controller.signal,
    });
    this.client.on("incoming-offer", this.onIncoming, {
      signal: this.#controller.signal,
    });
    this.client.on("peer-hungup", this.endOngoingCall, {
      signal: this.#controller.signal,
    });
  }

  get state() {
    return this.#state;
  }

  #setState(next: string) {
    console.log(
      `[CallSession.state-change] State machine moving from ${this.state} to ${next}`,
    );

    this.#state = next;
    this.emit("state-change", next);
  }

  get audio() {
    return this.localStream?.getAudioTracks()[0];
  }

  get video() {
    return this.localStream?.getVideoTracks()[0];
  }

  private cleanup() {
    this.localStream = null;
    this.remoteStream = null;
    this.#controller.abort();
    this.#controller = new AbortController();
  }

  endOngoingCall() {
    this.localStream?.getTracks().forEach(function (track) {
      track.stop();
    });
    this.remoteStream?.getTracks().forEach(function (track) {
      track.stop();
    });

    this.#setState("idle");
    this.client.disconnect();
    this.client.unsubscribe();

    this.cleanup();
  }

  private notify(message: string, data?: ExternalToast): string | number {
    return toast(message, {
      ...data,
    });
  }

  private async saveRemoteStream(ev: CustomEvent) {
    const stream = ev.detail as MediaStream;
    this.remoteStream = stream;
    this.emit("remote-stream", stream);
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
      "Media acquired, set local stream, and added tracks to the RTC client instance.",
    );
    log("Emitting local stream ev with the stream acquired ...");
    this.emit("local-stream", stream);
  }

  private async onAcceptIncoming(ev: CustomEvent, peerId: string) {
    this.client.connect(this.localUser);
    await this.acquireMedia();
    await this.client.createAnswer(ev, peerId);
  }

  private onDeclineIncoming(ev: CustomEvent) {
    ev.preventDefault();
    this.client.disconnect();
    toast.dismiss();
  }

  private onIncoming(ev: CustomEvent) {
    console.log("Recieving an Incoming offer ...");

    this.#setState("ringing-incoming");
    const offer = ev.detail;

    const { metadata = {} } = offer;
    const peer = metadata?.from ?? null;

    console.log(
      "[CallSession.onIncoming] Recieving an incoming call from " + peer,
    );

    this.notify(peer + " wants to connect with you.", {
      action: {
        label: "Accept",
        onClick: this.onAcceptIncoming.bind(this, ev, peer),
      },
      cancel: {
        label: "Decline",
        onClick: this.onDeclineIncoming.bind(this, ev),
      },
      duration: 5000,
    });
  }

  async sendOutgoing(peerId: string) {
    this.#setState("ringing-outgoing");
    const logger = this.getLogger("CallSession.sendOutgoing");
    logger("calling peer with id " + peerId);

    this.client.connect(this.localUser);

    await this.acquireMedia();
    await this.client.start(peerId);
  }
}
