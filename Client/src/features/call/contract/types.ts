import type { ServerMessageFor } from "./schema";

export type WebRTCEvents = {
  "incoming-offer": ServerMessageFor<"offer">;
  answer: ServerMessageFor<"answer">;
  "offer-decline": ServerMessageFor<"offer-decline">;
  "hang-up": ServerMessageFor<"hang-up">;
  "call-confirmation": ServerMessageFor<"confirmation">;
  error: ServerMessageFor<"error">;
  "peer-offline": ServerMessageFor<"offline">;
  "call-timeout": ServerMessageFor<"timeout">;
  "remote-stream": MediaStream;
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
  "peer-hungup": ServerMessageFor<"hang-up">;
  incoming: ServerMessageFor<"offer">;
};
