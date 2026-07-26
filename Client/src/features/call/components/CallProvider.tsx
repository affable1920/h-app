import { createContext, useEffect, useState, type ReactNode } from "react";
import CallSession from "../core/CallSession";
import useAuthStore from "@/stores/auth-store";
import signalingClient from "../core/SignalingClient";

export const CallContext = createContext<CallSession | null>(null);

export function CallProvider({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);

  const [session, setSession] = useState<CallSession | null>(null);

  useEffect(
    function () {
      console.log("creating a (Call Session) app-level singleton...");

      if (!user || !token) {
        console.log(
          "Not authenticated, not creating the Call Session instance",
        );
        return;
      }

      signalingClient.connect(token);
      setSession(new CallSession({ id: user.id, token }));
    },
    [token, user?.id],
  );

  return (
    <CallContext.Provider value={session}>{children}</CallContext.Provider>
  );
}
