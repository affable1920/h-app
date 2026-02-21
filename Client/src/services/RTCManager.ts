import signalingClient from "./SignalingClient";

/*

*/
enum ConnectionState {
  // the statuses below are ordered according to the flow

  IDLE, // nothing exists yet
  RTC_CREATED, // RTCPeer created
  MEDIA_ACQUIRED, // mic/camera ready
  OFFER_SENT,
  ANSWER_RECIEVED,
  CONNECTED,
  DISCONNECTED,
}

class RTCManager {
  private _config = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  };

  private _rtc: RTCPeerConnection | null = null;

  localStream: MediaStream | null = null;
  videoTrack: MediaStreamTrack | null = null;
  audioTrack: MediaStreamTrack | null = null;

  remoteStream: MediaStream | null = null;

  private state: ConnectionState = ConnectionState.IDLE;
  iceCandidateBuffer: Array<RTCIceCandidate> = [];

  private assertState(...states: ConnectionState[]) {
    if (!states.includes(this.state)) {
      throw new Error(
        `Expected state ${states.forEach((st) => ConnectionState[st])} but found ${this.state}`,
      );
    }
  }

  private get rtc(): RTCPeerConnection {
    if (!this._rtc) {
      throw new Error("RTC not initialized");
    }

    return this._rtc;
  }

  connect() {
    console.log("\nInitializing WebRTC client ...");

    this._rtc = new RTCPeerConnection(this._config);
    this.state = ConnectionState.RTC_CREATED;

    this.setupWsListeners();
    this.setupRTCListeners();
  }

  private setupRTCListeners() {
    this.assertState(ConnectionState.RTC_CREATED);
    const pc = this.rtc as RTCPeerConnection;

    pc.ontrack = (ev) => {
      console.info("\nRemote tracks recieved. Adding to remote stream.");
      this.remoteStream = ev.streams[0];
    };

    pc.onicecandidate = (ev) => {
      if (ev.candidate) {
        console.log(
          "\nON_ICE_CANDIDATE event called\n Sending ice candidate to remote peer.:\n",
          ev.candidate,
        );

        signalingClient.send("ice-candidate", {
          payload: ev.candidate,
          metadata: { to: "8f1351d8-9e3d-495d-a481-fe71107ee3af" },
        });
      }
    };

    pc.onsignalingstatechange = () => {
      console.log(
        `\nWebRTC signal state change\n Signaling State -> ${this.rtc.signalingState}\n Connection State -> ${this.rtc.connectionState}`,
      );
    };
  }

  flushIceCandidates = async () => {
    this.assertState(ConnectionState.ANSWER_RECIEVED);

    for (const candidate of this.iceCandidateBuffer) {
      await (this.rtc as RTCPeerConnection).addIceCandidate(candidate);
    }
  };

  private setupWsListeners() {
    signalingClient.on("offer", this.handleOffer);
    signalingClient.on("answer", this.handleAnswer);
    signalingClient.on("ice-candidate", this.handleIceCandidate);
  }

  private unsetWsListeners() {
    signalingClient.off("offer", this.handleOffer);
    signalingClient.off("answer", this.handleAnswer);
    signalingClient.off("ice-candidate", this.handleIceCandidate);
  }

  async acquireMedia() {
    this.assertState(ConnectionState.RTC_CREATED);

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });

    this.localStream = stream;

    this.audioTrack = stream.getAudioTracks()[0];
    this.videoTrack = stream.getVideoTracks()[0];

    stream.getTracks().forEach((track) => this.rtc.addTrack(track, stream));
    this.state = ConnectionState.MEDIA_ACQUIRED;
  }

  handleAnswer = async (ev: CustomEvent) => {
    this.assertState(ConnectionState.OFFER_SENT);

    const answer = ev.detail?.payload;
    await this.rtc.setRemoteDescription(answer);

    this.state = ConnectionState.ANSWER_RECIEVED;
    await this.flushIceCandidates();
  };

  handleOffer = async (ev: CustomEvent) => {
    await this.acquireMedia();
    await this.rtc.setRemoteDescription(ev.detail?.payload);

    await this.flushIceCandidates();
    const answer = await this.rtc.createAnswer();

    await this.rtc.setLocalDescription(answer);
    signalingClient.send("answer", {
      payload: answer,
      metadata: { to: "8f1351d8-9e3d-495d-a481-fe71107ee3af" },
    });
  };

  async createOffer() {
    const offer = await this.rtc.createOffer();
    await this.rtc.setLocalDescription(offer);

    signalingClient.send("offer", {
      payload: offer,
      metadata: { to: "8f1351d8-9e3d-495d-a481-fe71107ee3af" },
    });

    this.state = ConnectionState.OFFER_SENT;
  }

  handleIceCandidate = async (ev: CustomEvent) => {
    const candidate = ev.detail?.payload;

    if (this.rtc.remoteDescription?.type) {
      this.rtc.addIceCandidate(candidate);
    } else {
      this.iceCandidateBuffer.push(candidate);
    }
  };

  async start() {
    await this.acquireMedia();
    await this.createOffer();
  }

  private baseSetAll = () => {
    this.localStream = null;
    this.remoteStream = null;
    this.audioTrack = null;
    this.videoTrack = null;

    this.state = ConnectionState.IDLE;
  };

  disconnect() {
    console.log("\nDisconnect called on RTC, \nDisconnecting ...");

    this.localStream?.getTracks().forEach((track) => track.stop());
    this.rtc.close();

    this.unsetWsListeners();
    this.baseSetAll();
  }
}

const rtc = new RTCManager();
export default rtc;
