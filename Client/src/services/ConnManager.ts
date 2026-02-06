class ConnManager {
  private readonly configuration = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  };
  private readonly url: string =
    import.meta.env.VITE_WS_URL ||
    "wss://unsecretively-nontraditional-alana.ngrok-free.dev/ws";

  private ws: WebSocket | null = null;
  private rtc: RTCPeerConnection | null = null;

  start() {
    this.ws = new WebSocket(this.url);
    this.addSocketListeners();
  }

  get RTC() {
    return this.rtc;
  }

  get WS() {
    return this.ws;
  }

  private addSocketListeners() {
    if (!this.ws) {
      return;
    }

    this.ws.onopen = () => {
      console.log("websocket conn established...");
      this.sendMsg("Hey server ...");
    };

    this.ws.onerror = (ev) => {
      console.log("ws error occurred. closing the conn.\n\n error event", ev);
      this.closeSocketConn(1000, "error occurred");
    };

    this.ws.onmessage = async (ev) => {
      console.log("message recieved via ws", ev.data);

      try {
        const msg: any = JSON.parse(ev.data);

        if (!this.rtc) {
          console.log("rtc conn not initiated yet ...");

          return;
        }

        switch (msg?.type) {
          case "answer":
            console.log("answer recieved ...");

            await this.rtc.setLocalDescription(msg.answer);
            break;

          case "offer":
            await this.rtc.setRemoteDescription(msg.offer);

            this.rtc.createAnswer().then(async (answer) => {
              await (this.rtc as RTCPeerConnection).setLocalDescription(answer);

              this.sendMsg({
                type: "answer",
                answer,
              });
            });

            break;

          case "ice-candidate":
            console.log("ice candidate recieved ...");

            const candidate = msg?.candidate;
            await this.rtc.addIceCandidate(candidate);
        }
      } catch (ex) {
        console.log("Error inside ConnectionManager constructor. \n", ex);
      }
    };

    this.ws.onclose = () => {
      console.log("websocket conn closed...");
    };
  }

  sendMsg(msg: any) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.log("websocket not opened. ready state", this.ws?.readyState);
      return;
    }

    let stringMsg: string;

    if (typeof msg === "string") {
      stringMsg = msg;
    } else {
      stringMsg = JSON.stringify(msg);
    }

    this.ws.send(stringMsg);
  }

  private addRTCListeners() {
    (this.rtc as RTCPeerConnection).onicecandidate = (ev) => {
      console.log("ice candidate ev fired ...");

      const candidate = ev.candidate;

      if (candidate) {
        this.sendMsg({
          type: "ice-candidate",
          candidate,
        });
      }
    };
  }

  initiatePeerConnection(tracks: MediaStreamTrack[], stream: MediaStream) {
    this.rtc = new RTCPeerConnection(this.configuration);
    this.addRTCListeners();

    if (tracks && stream) {
      tracks.forEach((track) => this.rtc?.addTrack(track, stream));
    }
  }

  closeRTCConnection() {
    this.rtc?.close();
  }

  closeSocketConn(code?: number, reason?: string) {
    this.ws?.close(code, reason);
  }

  close() {
    this.closeSocketConn();
    this.closeRTCConnection();
  }
}

const connectionClient = new ConnManager();
export default connectionClient;
