import { toast } from "sonner";
import { config } from "@/config";
import { logout } from "@/stores/authStore";

type MsgType =
  | "offer"
  | "answer"
  | "ice-candidate"
  | "text"
  | "join"
  | "offline"
  | "broadcast";

type Message = {
  type: MsgType;
  payload: any;
  metadata: { to: string; from?: string };
};

class SignalingClient extends EventTarget {
  private ws: WebSocket | null = null;
  private readonly url: string = config.ws_url;

  private delay = 1000;
  private shouldReconnect = true;

  private attempt = 1;
  private maxAttempts = 3;

  on = (type: MsgType, handler: (ev: CustomEvent) => void) => {
    this.addEventListener(type, handler as EventListener);
  };

  off = (type: MsgType, handler: (ev: CustomEvent) => void) => {
    this.removeEventListener(type, handler as EventListener);
  };

  connect = (token: string) => {
    this.ws = new WebSocket(`${this.url}`, token);

    this.ws.onopen = () => {
      this.dispatchEvent(new CustomEvent("join"));
      this.send("join", { payload: "Hey server .." });

      this.shouldReconnect = true;
      this.attempt = 1;
      this.delay = 1000;
    };

    this.ws.onmessage = (ev) => {
      var message;

      try {
        message = JSON.parse(ev.data) as Message;
        console.log("\nWS message recieved\n", message);

        switch (message?.type) {
          case "offline":
            toast("Target ws offline ...", {
              description: message.payload,
            });
            break;

          case "text":
            toast("Websocket text message", { description: message.payload });
            break;

          case "broadcast":
            toast("Broadcast", { description: message.payload });
            break;

          default:
            this.dispatchEvent(
              new CustomEvent(message.type, { detail: message }),
            );
        }
      } catch {
        console.log(
          `JSON parsing error for the recieved socket message.\nMESSAGE ->\n${message}`,
        );
      }
    };

    this.ws.onerror = () => {
      this.dispatchEvent(new CustomEvent("error"));
    };

    this.ws.onclose = (ev) => {
      console.log("\nWebsocket closed. EV ->:\n", ev);

      if (ev.code === 4444) {
        const msg =
          "\nSocket conn closed because your session expired. Relogin to continue.";
        console.log(msg);

        this.close();
        logout();
      }

      if (ev.code === 1006 && !ev.wasClean) {
        this.reconnect(token);
      }
    };
  };

  get isConnected() {
    if (!this.ws) {
      return false;
    }

    return this.ws.readyState <= WebSocket.OPEN;
  }

  private reconnect(token: string) {
    console.error(
      `\n WS connection closed with CODE #1006 -> (Abnormal Closure)\nWill try to reconnect.`,
    );

    if (!this.shouldReconnect) {
      console.info(
        "\nShould reconnect is false. Not reconnecting the WS connection.",
      );
      return;
    }

    if (this.attempt > this.maxAttempts) {
      console.error(
        "\nMax attemps to reconnect WS connection reached. Aborting.",
      );

      this.close(1002, "Max attempts to reconnect reached.");
      this.shouldReconnect = false;
      return;
    }

    console.info(
      `\nAttempting to reconnect.\nAttempt number -> ${this.attempt}\nTrying after ${this.delay} seconds.`,
    );

    setTimeout(() => {
      this.connect(token);
    }, this.delay);

    this.attempt += 1;
    this.delay =
      this.delay + this.attempt * 1000 + this.attempt * Math.random();
  }

  send = (type: MsgType, data: any) => {
    console.log(
      "SEND CALLED",
      type,
      "ws:",
      this.ws,
      "readyState:",
      this.ws?.readyState,
    );

    if (!this.ws) {
      console.log("Cannot send websocket message. Websocket not connected.");
      return;
    }

    this.ws.send(
      JSON.stringify({
        type,
        ...data,
      }),
    );
  };

  close = (code: number = 1000, reason: string = "") => {
    console.log(`"\nClosing ws connection ...\nReason -> ${reason}"`);
    this.ws?.close(code, reason);
  };
}

const signalingClient = new SignalingClient();
export default signalingClient;
