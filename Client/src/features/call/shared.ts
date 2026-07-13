export type PeerIdentity = {
  peerId: string;
};

export type ErrorDetail = {
  msg?: string;
  code?: string;
};

export type SessionDescriptionPayload = {
  sdp: RTCSessionDescriptionInit;
};

export type IceCandidatePayload = {
  candidate: RTCIceCandidateInit;
};

export type MediaPayload = {
  stream: MediaStream;
};
