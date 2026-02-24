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

type EventHandler = (ev: CustomEvent) => void;

class SignalingClient extends EventTarget {
  private ws: WebSocket | null = null;
  private readonly url: string = config.ws_url;

  private delay = 1000;
  private shouldReconnect = true;

  private attempt = 1;
  private readonly maxAttempts = 3;

  private evs: Set<{ type: MsgType; handler: EventHandler }> = new Set();

  private detachAll() {
    for (const { type, handler } of this.evs) {
      this.removeEventListener(type, handler as EventListener);
    }

    this.evs.clear();
  }

  on(type: MsgType, handler: EventHandler) {
    console.log(
      `\nAttaching ev listener to signaling client\n Type -> (${type})`,
    );

    this.addEventListener(type, handler as EventListener);
    this.evs.add({ type, handler });
  }

  off = (type: MsgType, handler: EventHandler) => {
    console.log(
      `\nRemoving ev listener on signaling client\n Type -> (${type})`,
    );
    this.removeEventListener(type, handler as EventListener);
    this.evs.delete({ type, handler });
  };

  connect = (token: string) => {
    if (this.ws) {
      return;
    }

    this.ws = new WebSocket(`${this.url}`, token);

    this.ws.onopen = () => {
      this.dispatchEvent(new CustomEvent("join"));
      this.send("join", { payload: "Hey server .." });

      this.shouldReconnect = true;
      this.attempt = 1;
      this.delay = 1000;
    };

    this.addEventListener("broadcast", (ev) => {
      console.log(
        "\nRecieved a broadcast message from the server. The msg is logged below ->\n",
        ev,
      );
      toast("BROADCAST");
    });

    this.ws.onmessage = (ev) => {
      try {
        this.onMessage(JSON.parse(ev.data));
      } catch {
        console.log(
          `JSON parsing error for the recieved socket message.\nMESSAGE ->\n`,
        );
      }
    };

    this.ws.onerror = () => {
      console.log("\nWebsocket error occurred !");
    };

    this.ws.onclose = (ev) => {
      console.log("\nWebsocket close event raised. ev ->\n", ev);

      if (ev.code === 4444) {
        const msg = "\nLogging out. Relogin to continue.";

        this.close();
        this.shouldReconnect = false;

        toast("4444", { description: msg });
        console.log(4444, msg);
        logout();
        return;
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
    console.info("\nWEBSOCKET SEND CALLED\nWebsocket ->\n", this.ws);

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

    this.detachAll();
  };

  private onMessage = (msg: any) => {
    const message: Message = JSON.parse(msg);
    switch (message.type) {
      case "text":
        toast("Websocket text message", { description: message.payload });
        break;

      case "offline":
        this.dispatchEvent(
          new CustomEvent("offline", { detail: message.payload }),
        );
        break;

      case "broadcast":
        this.dispatchEvent(
          new CustomEvent("broadcast", { detail: message.payload }),
        );
        break;

      case "offer":
        this.dispatchEvent(
          new CustomEvent("offer", { detail: message.payload }),
        );
        break;

      case "answer":
        this.dispatchEvent(
          new CustomEvent("answer", { detail: message.payload }),
        );
        break;

      case "ice-candidate":
        this.dispatchEvent(
          new CustomEvent("ice-candidate", { detail: message.payload }),
        );
        break;

      default:
        this.dispatchEvent(
          new CustomEvent(message.type, { detail: message.payload }),
        );
    }
  };
}

const signalingClient = new SignalingClient();
export default signalingClient;
