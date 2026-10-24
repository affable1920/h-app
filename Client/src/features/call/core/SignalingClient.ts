import { config } from "@/core/config";
import EventEmitter from "@/features/call/core/EventEmitter";

import {
  clientMessageSchema,
  serverMessageSchema,
  type ClientMessage,
  type SignalingClientEvents,
} from "../contract/schema";

class SignalingClient extends EventEmitter<SignalingClientEvents> {
  private ws: WebSocket | null = null;
  private readonly url: string = config.ws_url;

  private readonly delay = 1_000;
  private shouldReconnect = false;

  private attempt = 1;
  private readonly maxAttempts = 3;

  private resetWsVariables() {
    this.shouldReconnect = true;
    this.attempt = 1;
  }

  constructor() {
    super();
  }

  private onopen() {
    console.log(
      "[SignalingClient.onopen] Websockt connection opened sucessfully..",
    );

    this.resetWsVariables();
  }

  private onclose(token: string, ev: CloseEvent) {
    if (ev.code === 1006 && !ev.wasClean) {
      this.reconnect(token);
    }

    if (ev.code === 4444) {
      console.error(
        "[SignalingClient.onclose] Connection closed by the server. Token is probably invalid.",
      );

      this.close(4444);

      this.emit("error", {
        msgType: "error",
        payload: {
          message: ev.reason,
          code: String(ev.code),
        },
      });
    }
  }

  private onmessage(ev: MessageEvent) {
    let raw: unknown;

    try {
      raw = JSON.parse(ev.data);
    } catch {
      console.error("Recieved invalid websocket JSON.");
      return;
    }

    const parsed = serverMessageSchema.safeParse(raw);

    if (!parsed.success) {
      console.error("Recieved websocket message with an invalid shape.. ");
      console.log("Message recieved .. ", raw);

      return;
    }

    const message = parsed.data;
    this.emit(message.msgType, message);
  }

  private reconnect(token: string) {
    const lg = this.getLogger("SignalingClient.reconnect");

    if (this.attempt > this.maxAttempts) {
      lg("All attempts to reconnect have exhausted. Closing the connection..");
      this.close(1002, "Maximum reconnect attempts reached..");

      this.shouldReconnect = false;
      return;
    }

    if (!this.shouldReconnect) {
      lg("Found SHOULD_RECONNECT to be false. Aborting..");
      this.close(1002, "SHOULD_NOT reconnect");
      return;
    }

    const delay =
      this.attempt === 1
        ? this.delay
        : this.delay * this.attempt +
          this.delay * this.attempt +
          (this.delay * this.attempt) / 2;

    lg(
      `Attempting to reconnect...
      \nTrying Attempt (${this.attempt}) after (${delay} ms.)`,
    );

    setTimeout(this.connect.bind(this, token), delay);
    this.attempt += 1;
  }

  private waitForOpen(socket: WebSocket): Promise<void> {
    if (socket.readyState === WebSocket.OPEN) {
      return Promise.resolve();
    }

    return new Promise(function (resolve, reject) {
      function cleanup() {
        socket.removeEventListener("open", onOpen);
        socket.removeEventListener("close", onFailure);
        socket.removeEventListener("error", onFailure);
      }

      function onOpen() {
        cleanup();
        resolve();
      }

      function onFailure() {
        cleanup();
        reject();
      }

      socket.addEventListener("open", onOpen, { once: true });
      socket.addEventListener("close", onFailure, { once: true });
      socket.addEventListener("error", onFailure, { once: true });
    });
  }

  connect(token: string): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return Promise.resolve();
    }

    if (this.ws?.readyState === WebSocket.CONNECTING) {
      return this.waitForOpen(this.ws);
    }

    const socket = new WebSocket(this.url, token);
    this.ws = socket;

    socket.onopen = this.onopen;
    socket.onmessage = this.onmessage;
    socket.onclose = this.onclose.bind(this, token);

    return this.waitForOpen(socket);
  }

  get isConnected() {
    if (!this.ws) {
      return false;
    }

    return this.ws.readyState <= WebSocket.OPEN;
  }

  get _readyState() {
    return this.ws?.readyState;
  }

  send(message: ClientMessage) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    const validated = clientMessageSchema.parse(message);
    this.ws.send(JSON.stringify(validated));
  }

  close(code: number = 1000, reason?: string) {
    console.log(
      `"Closing signaling client connection with code ${code} and reason ${reason}.."`,
    );

    if ((this._readyState ?? 0) > 1) {
      return;
    }

    this.ws?.close(code, reason);
  }
}

const signalingClient = new SignalingClient();
export default signalingClient;
