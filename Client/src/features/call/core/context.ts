import { createContext } from "react";
import type CallSession from "./CallSession";

export const CallContext = createContext<CallSession | null>(null);
