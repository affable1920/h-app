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

  #reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  private readonly delay = 1_000;
  private shouldReconnect = true;

  private attempt = 1;
  private readonly maxAttempts = 3;

  private resetWsVariables() {
    this.shouldReconnect = true;
    this.attempt = 1;
  }

  constructor() {
    super();
  }

  private stopReconnecting() {
    if (this.#reconnectTimer) {
      clearTimeout(this.#reconnectTimer);
      this.#reconnectTimer = null;
    }

    this.shouldReconnect = false;
  }

  private onopen() {
    console.log(
      "[SignalingClient.onopen] Websocket connection opened sucessfully..",
    );

    this.resetWsVariables();
  }

  private onclose(token: string, ev: CloseEvent) {
    if (ev.code === 4444) {
      console.error(
        "[SignalingClient.onclose] Connection closed by the server.",
        "\nProbable cause: [Invalid token].",
      );

      this.stopReconnecting();

      this.emit("error", {
        msgType: "error",
        payload: {
          message: ev.reason,
          code: String(ev.code),
        },
      });

      return;
    }

    if (ev.code === 1006 && !ev.wasClean) {
      this.reconnect(token);
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
    const logger = this.getLogger("SignalingClient.reconnect");

    if (this.attempt > this.maxAttempts) {
      logger("All attempts to reconnect have exhausted..");

      this.stopReconnecting();
      return;
    }

    if (!this.shouldReconnect) {
      logger("Found SHOULD_RECONNECT to be false. Aborting..");

      this.stopReconnecting();
      return;
    }

    const delay =
      this.attempt === 1
        ? this.delay
        : this.delay * this.attempt +
          this.delay * this.attempt +
          (this.delay * this.attempt) / 2;

    logger(
      `Attempting to reconnect...
      \nTrying Attempt (${this.attempt}) after (${delay} ms.)`,
    );

    this.#reconnectTimer = setTimeout(
      function (this: SignalingClient) {
        this.#reconnectTimer = null;
        void this.connect(token).catch(function (err) {
          console.error(`Reconnect attempt failed: ${err}`);
        });
      }.bind(this),
      delay,
    );

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
        reject(new Error("Signaling client closed before it opened."));
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

  send(message: ClientMessage) {
    const socket = this.ws;

    if (!socket || socket.readyState !== WebSocket.OPEN) {
      console.log("Websocket not OPEN. Cannot send a message to the server..");
      return;
    }

    const validated = clientMessageSchema.parse(message);
    socket.send(JSON.stringify(validated));
  }

  close(code = 1000, reason?: string) {
    this.stopReconnecting();
    const socket = this.ws;

    if (!socket || socket.readyState >= WebSocket.CLOSING) {
      return;
    }

    socket.close(code, reason);
  }
}

const signalingClient = new SignalingClient();
export default signalingClient;
