import { config } from "@/config";
import EventEmitter from "@/features/call/core/EventEmitter";
import type {
  SignalingEventBody,
  SignalingEventMessage,
  SignalingEvent,
} from "../types";

class SignalingClient extends EventEmitter {
  private ws: WebSocket | null = null;
  private readonly url: string = config.ws_url;

  private delay = 1000;
  private shouldReconnect = true;

  private attempt = 1;
  private readonly maxAttempts = 3;

  private resetWsVariables() {
    this.shouldReconnect = true;
    this.attempt = 1;
    this.delay = 1000;
  }

  private onOpen() {
    console.log(
      "[SignalingClient.onopen] Websocket connection opened. readyState: ",
      this.ws?.readyState,
    );

    this.resetWsVariables();
  }

  private onClose(token: string, ev: CloseEvent) {
    if (ev.code === 4444) {
      this.close();
      this.shouldReconnect = false;
      this.emit("session-expired");
      return;
    }

    if (ev.code === 1006 && !ev.wasClean) {
      this.reconnect(token);
    }
  }

  private onMessage(ev: MessageEvent) {
    const msg: SignalingEventMessage = JSON.parse(JSON.parse(ev.data));
    const msgType = msg.type;
    this.emit(msgType, msg);
  }

  private reconnect(token: string) {
    if (this.attempt >= this.maxAttempts) {
      console.info(
        "All reconnect attempts exhausted. Closing the connection...",
      );

      this.close(1002, "Maximum reconnect attempts reached.");
      this.shouldReconnect = false;
      return;
    }

    let nextDelay = this.delay + this.attempt * this.delay * 2;

    console.info(
      `Attempting to reconnect...
       \nTrying Attempt (${this.attempt}) after (${nextDelay} ms.)`,
    );

    setTimeout(this.connect.bind(this, token), nextDelay);
    this.attempt += 1;
  }

  connect(token: string) {
    console.log("\nRequest to create a new Websocket connection ...");

    if (this.isConnected) {
      console.log(
        "\nWebsocket connection is already in (CONNECTING | OPEN) state. Aborting connection creation request.",
        "current websocket connection state: " + this.isConnected,
      );
      return;
    }

    console.log("[SignalingClient.connect] Connecting WebSocket to ", this.url);
    this.ws = new WebSocket(this.url, token);

    this.ws.onopen = this.onOpen;
    this.ws.onmessage = this.onMessage;

    this.ws.onclose = this.onClose.bind(this, token);
  }

  get isConnected() {
    if (!this.ws) {
      return false;
    }

    return this.ws.readyState <= WebSocket.OPEN;
  }

  get connectionState() {
    return this.ws?.readyState;
  }

  send<K extends SignalingEvent>(
    msgType: K,
    msgData: SignalingEventBody<K> = {} as SignalingEventBody<K>,
  ) {
    if (!this.ws) {
      return;
    }

    this.ws.send(
      JSON.stringify({
        msgType,
        ...msgData,
      }),
    );
  }

  close(code: number = 1000, reason?: string) {
    console.log(`"\nClosing ws connection. \nReason: ${reason}"`);
    this.ws?.close(code, reason);
  }
}

const signalingClient = new SignalingClient();
export default signalingClient;
