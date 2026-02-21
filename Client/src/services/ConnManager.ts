import useAuthStore from "@/stores/authStore";
import { toast } from "sonner";

enum ConnectionState {
  // the statuses below are ordered according to the flow

  IDLE, // nothing exists yet
  MEDIA_READY, // mic/camera ready
  WS_CONNECTED, // signaling through ws ready
  RTC_CREATED, // RTCPeer created
  OFFER_SENT,
  ANSWER_RECIEVED,
  CONNECTED,
  DISCONNECTING,
  CLOSED,
  ERROR,
}

type MsgType = "offer" | "answer" | "ice-candidate" | "simple";

type Message = {
  type: MsgType;
  content: any;
  [key: string]: any;
};

class ConnManager {
  private readonly configuration = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  };

  private state: ConnectionState = ConnectionState.IDLE;

  localStream: MediaStream | null = null;
  audioTrack: MediaStreamTrack | null = null;
  videoTrack: MediaStreamTrack | null = null;
  remoteStream: readonly MediaStream[] | null = null;

  private assertState(...allowed: ConnectionState[]) {
    if (!allowed.includes(this.state)) {
      throw new Error(`Invalid state transition from ${this.state}`);
    }
  }

  private readonly url: string =
    import.meta.env.VITE_WS_URL ||
    "wss://unsecretively-nontraditional-alana.ngrok-free.dev/ws";

  private ws: WebSocket | null = null;
  private rtc: RTCPeerConnection | null = null;

  init(token: string) {
    this.ws = new WebSocket(`${this.url}?token=${token}`);
    this.addWsListeners();
  }

  async acquireMedia() {
    this.assertState(ConnectionState.IDLE);

    const stream = await window.navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });

    this.localStream = stream;

    this.audioTrack = stream.getAudioTracks()[0];
    this.videoTrack = stream.getVideoTracks()[0];

    this.state = ConnectionState.MEDIA_READY;
  }

  private addWsListeners() {
    const socket = this.ws as WebSocket;

    socket.onopen = () => {
      console.log("websocket conn established...");
      this.state = ConnectionState.WS_CONNECTED;
    };

    socket.onerror = (ev) => {
      console.log("ws error occurred.\n closing the conn.\n\n error event", ev);
      this.closeSocketConn();
    };

    socket.onmessage = async (ev) => {
      console.log("ws msg recieved\n", ev.data);

      try {
        const msg: Message = JSON.parse(ev.data);

        switch (msg?.type) {
          case "answer":
            this.assertState(ConnectionState.OFFER_SENT);
            await this.rtc?.setRemoteDescription(msg.answer);

            break;

          case "offer":
            await this.acquireMedia();
            this.createRTCPeer();

            const pc = this.rtc as RTCPeerConnection;
            await pc.setRemoteDescription(msg.offer);

            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            this.sendMsg("answer", answer);
            break;

          case "ice-candidate":
            const candidate = msg?.content;
            await this.rtc?.addIceCandidate(candidate);
        }
      } catch (ex) {
        console.log("Error inside ConnectionManager constructor. \n", ex);
      }
    };

    socket.onclose = (ev) => {
      console.log(ev);

      if (ev.code === 1006) {
        const msg = "session expired. please login again";
        console.log(msg);
        toast.error(msg);

        useAuthStore.persist.clearStorage();
      }

      console.log("websocket conn closed...");
    };
  }

  sendMsg(type: MsgType, data: any, ...addons: any[]) {
    this.assertState(ConnectionState.WS_CONNECTED);

    const ws = this.ws as WebSocket;

    const msg: Message = {
      type,
      content: data,
      ...addons,
    };

    ws.send(JSON.stringify(msg));
  }

  async createOffer(options?: RTCOfferOptions) {
    this.assertState(ConnectionState.RTC_CREATED);

    const offer = await this.rtc?.createOffer(options);
    this.sendMsg("offer", offer);
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

  async startCall(token: string) {
    this.assertState(ConnectionState.IDLE);

    this.init(token);
    await this.acquireMedia();
    this.createRTCPeer();

    await this.createOffer();
  }

  createRTCPeer() {
    this.assertState(ConnectionState.MEDIA_READY);

    this.rtc = new RTCPeerConnection(this.configuration);

    this.rtc.onicecandidate = (ev) => this.handleIce(ev);

    this.rtc.ontrack = (ev) => this.handleRemoteTrack(ev);

    this.rtc.onconnectionstatechange = (ev) => {
      console.log("rtc connection state change ev\n", ev);
    };

    const stream = this.localStream as MediaStream;

    this.rtc.addTrack(this.audioTrack as MediaStreamTrack, stream);
    this.rtc.addTrack(this.videoTrack as MediaStreamTrack, stream);

    this.state = ConnectionState.RTC_CREATED;
  }

  handleIce(ev: RTCPeerConnectionIceEvent) {
    const candidate = ev.candidate;

    if (candidate) {
      this.sendMsg("ice-candidate", candidate);
    }
  }

  handleRemoteTrack(ev: RTCTrackEvent) {
    this.assertState(ConnectionState.ANSWER_RECIEVED);
    this.remoteStream = ev.streams;
  }
}

const connectionClient = new ConnManager();
export default connectionClient;
