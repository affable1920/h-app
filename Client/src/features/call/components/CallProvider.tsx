import { createContext, useEffect, useState, type ReactNode } from "react";
import useAuthStore from "@/stores/auth-store";
import CallSession from "../core/CallSession";
import signalingClient from "../core/SignalingClient";

export const CallContext = createContext<CallSession | null>(null);

export function CallProvider({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);

  const [session, setSession] = useState<CallSession | null>(null);

  useEffect(function () {
    console.log("creating a (Call Session) app-level singleton...");

    if (!user || !token) {
      console.log("Not authenticated, not creating the Call Session instance");
      return;
    }

    signalingClient.connect(token);
    setSession(new CallSession({ id: user.id, token }));
  }, []);

  useEffect(
    function () {
      if (!session || !(user && token)) {
        return;
      }
    },

    [session],
  );

  return (
    <CallContext.Provider value={session}>{children}</CallContext.Provider>
  );
}
