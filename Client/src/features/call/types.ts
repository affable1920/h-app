// Raw Websocket events
export type SignalingEvent =
  | "offer"
  | "answer"
  | "ice-candidate"
  | "error"
  | "offline"
  | "hang-up"
  | string;

type SignalingPayloads = {
  offer: RTCSessionDescriptionInit;
  answer: RTCSessionDescriptionInit;
  "ice-candidate": RTCIceCandidateInit;
  error: string;
  offline: void;
  "hang-up": void;
  [K: string]: unknown;
};

// sent to remote peer
export type SignalingEventMessage<K extends SignalingEvent = SignalingEvent> = {
  msgType: K;
  payload: SignalingPayloads[K];
  metadata: {
    to: string;
    from: string;
  };
};

export type SignalingClientEvents = {
  [K in SignalingEvent]: SignalingEventMessage<K>;
};

export type WebRTCEvents = {
  "incoming-offer": SignalingEventMessage<"offer">; // relayed as-is from SignalingClient
  "hang-up": SignalingEventMessage<"hang-up">; // relayed as-is
  "remote-stream": MediaStream;
  "offer-decline": void;
  "offer-accept": void;
};

export type CallSessionState =
  | "idle"
  | "ringing-incoming"
  | "ringing-outgoing"
  | "connecting"
  | "connected";

export type CallSessionEvents = {
  "state-change": CallSessionState;
  "remote-stream": MediaStream;
  "local-stream": MediaStream;
  "peer-hungup": void;
};
