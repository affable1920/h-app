import { config } from "@/core/config";
import EventEmitter from "@/features/call/core/EventEmitter";
import type {
  SignalingEventMessage,
  SignalingEvent,
  SignalingClientEvents,
} from "../types";

class SignalingClient extends EventEmitter<SignalingClientEvents> {
  /** 
  - event listeners lifecycle for the signaling-client

  being a session-scoped singleton, listeners should be attached as long as the user 
  is connected to the websocket. PERIOD. This client has nothing to do with either any ongoing call or
  a connected RTC client. Nothing on this client gets torn down per call.

  examples - app tear down, user forced logout, forced reconnect
  **/

  private ws: WebSocket | null = null;
  private readonly url: string = config.ws_url;

  private readonly delay = 1000;
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

  private onOpen() {
    console.log(
      "[SignalingClient.onopen] Websocket connection opened. readyState: ",
      this.ws?.readyState,
    );

    this.resetWsVariables();
  }

  private onClose(token: string, ev: CloseEvent) {
    if (ev.code === 1006 && !ev.wasClean) {
      this.reconnect(token);
    }
  }

  private onMessage<K extends SignalingEvent>(ev: MessageEvent) {
    const msg: SignalingEventMessage<K> = JSON.parse(JSON.parse(ev.data));
    const { msgType } = msg;
    this.emit(msgType, msg);
  }

  private reconnect(token: string) {
    const lg = this.getLogger("SignalingClient.reconnect");

    if (this.attempt > this.maxAttempts) {
      lg("All attempts to reconnect exhausted. Closing the connection...");

      this.close(1002, "Maximum reconnect attempts reached.");

      this.shouldReconnect = false;
      return;
    }

    if (!this.shouldReconnect) {
      lg("found should reconnect to be false, aborting ...");
      this.close(1002, "should not reconnect");
      return;
    }

    const dly =
      this.attempt === 1
        ? this.delay
        : this.delay * this.attempt +
          this.delay * this.attempt +
          (this.delay * this.attempt) / 2;

    lg(
      `Attempting to reconnect...
          \nTrying Attempt (${this.attempt}) after (${dly} ms.)`,
    );

    setTimeout(this.connect.bind(this, token), dly);
    this.attempt += 1;
  }

  connect(token: string) {
    const lg = this.getLogger("SignalingClient.connect");
    lg("\nNew  websocket connection request recieved ...");

    if (this.isConnected) {
      lg(
        "\nWebsocket connection is already in (connected) or (connecting). Aborting connection creation request. current connection state: " +
          this.isConnected,
      );
      return;
    }

    lg("Connecting WebSocket to " + this.url);

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
    msgData: Omit<SignalingEventMessage, "msgType">,
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
    console.log(
      `"Closing signaling client connection with code ${code} and reason ${reason}"`,
    );

    if ((this.connectionState ?? 0) > 1) {
      return;
    }

    this.ws?.close(code, reason);
  }
}

const signalingClient = new SignalingClient();
export default signalingClient;
