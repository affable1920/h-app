// Raw Websocket events
export type SignalingEvent =
  | "offer"
  | "answer"
  | "ice-candidate"
  | "error"
  | "session-expired"
  | "offline"
  | "hang-up";

export type SignalingEventMessage<K extends SignalingEvent = SignalingEvent> = {
  type: K;
  payload: unknown;
  metadata: {
    from: string;
    to: string;
  };
};

export type SignalingEventBody<K extends SignalingEvent> = Omit<
  SignalingEventMessage<K>,
  "type"
>;
