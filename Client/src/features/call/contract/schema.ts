import { z } from "zod";

const UUID = z.uuid();

const appointmentContextSchema = z.object({
  appointmentId: UUID,
});

const targetContextSchema = appointmentContextSchema.extend({
  to: UUID,
});

const peerContextSchema = appointmentContextSchema.extend({
  from: UUID,
});

const optionalAppointmentContextSchema = z.object({
  appointmentId: UUID.optional(),
});

const sessionDescriptionSchema = z.object({
  type: z.enum(["offer", "answer", "pranswer", "rollback"]),
  sdp: z.string().optional(),
});

const iceCandidateSchema = z.object({
  candidate: z.string(),
  sdpMid: z.string().nullable().optional(),
  sdpMLineIndex: z.number().int().nullable().optional(),
  usernameFragment: z.string().nullable().optional(),
});

const errorPayloadSchema = z.object({
  code: z.string(),
  message: z.string(),
});

const noticePayloadSchema = z.object({
  message: z.string(),
});

//**
// client -> server
// "from" is delibrately absent
//  */

export const clientMessageSchema = z.discriminatedUnion("msgType", [
  z.object({
    msgType: z.literal("init"),
    metadata: targetContextSchema,
  }),
  z.object({
    msgType: z.literal("offer"),
    payload: sessionDescriptionSchema,
    metadata: targetContextSchema,
  }),
  z.object({
    msgType: z.literal("answer"),
    payload: sessionDescriptionSchema,
    metadata: targetContextSchema,
  }),
  z.object({
    msgType: z.literal("ice-candidate"),
    payload: iceCandidateSchema,
    metadata: targetContextSchema,
  }),
  z.object({
    msgType: z.literal("hang-up"),
    metadata: targetContextSchema,
  }),
  z.object({
    msgType: z.literal("offer-decline"),
    metadata: targetContextSchema,
  }),
]);

/* 
Server -> client
Direct messages do not need from, 
only relayed messages do
*/

export const serverMessageSchema = z.discriminatedUnion("msgType", [
  z.object({
    msgType: z.literal("confirmation"),
    metadata: appointmentContextSchema,
  }),
  z.object({
    msgType: z.literal("error"),
    payload: errorPayloadSchema,
    metadata: optionalAppointmentContextSchema.optional(),
  }),
  z.object({
    msgType: z.literal("offline"),
    payload: noticePayloadSchema,
    metadata: appointmentContextSchema,
  }),
  z.object({
    msgType: z.literal("timeout"),
    payload: noticePayloadSchema,
    metadata: optionalAppointmentContextSchema,
  }),
  z.object({
    msgType: z.literal("offer"),
    payload: sessionDescriptionSchema,
    metadata: peerContextSchema,
  }),
  z.object({
    msgType: z.literal("answer"),
    payload: sessionDescriptionSchema,
    metadata: peerContextSchema,
  }),
  z.object({
    msgType: z.literal("ice-candidate"),
    payload: iceCandidateSchema,
    metadata: peerContextSchema,
  }),
  z.object({
    msgType: z.literal("hang-up"),
    payload: noticePayloadSchema,
    metadata: peerContextSchema,
  }),
  z.object({
    msgType: z.literal("offer-decline"),
    payload: noticePayloadSchema,
    metadata: peerContextSchema,
  }),
]);

export type ClientMessage = z.infer<typeof clientMessageSchema>;
export type ServerMessage = z.infer<typeof serverMessageSchema>;

export type ServerMessageFor<T extends ServerMessage["msgType"]> = Extract<
  ServerMessage,
  { msgType: T }
>;

export type SignalingClientEvents = {
  [T in ServerMessage["msgType"]]: ServerMessageFor<T>;
};

export type ClientMessageFor<T extends ClientMessage["msgType"]> = Extract<
  ClientMessage,
  { msgType: T }
>;

type WithoutMetadata<T> = T extends unknown ? Omit<T, "metadata"> : never;
export type ClientMessageBody = WithoutMetadata<ClientMessage>;
