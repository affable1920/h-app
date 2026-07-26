import type { SignalingEventMessage } from "./types";

type RtcEvent = "incoming-offer" | "peer-hangup" | "remote-stream";
type RtcEventPayload = {
  "incoming-offer": SignalingEventMessage<"offer">;
  "peer-hangup": SignalingEventMessage<"hang-up">;
  "remote-stream": CustomEvent<MediaStream>;
};
