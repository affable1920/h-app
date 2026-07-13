import { createContext, useEffect, useState, type ReactNode } from "react";
import CallSession from "../core/CallSession";
import useAuthStore from "@/stores/authStore";
import signalingClient from "../core/SignalingClient";

export const CallContext = createContext<CallSession | null>(null);

export function CallProvider({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);

  const [session, setSession] = useState<CallSession | null>(null);

  useEffect(
    function () {
      console.log("Will create a Call Session app-level singleton...");

      if (!user || !token) {
        console.log(
          "[CallProvider.Effect] Not authenticated, not initialising the Call Session instance",
        );
        return;
      }

      signalingClient.connect(token);
      setSession(new CallSession({ id: user.id, token: token }));

      console.log(
        `Call Session instance created for user "${user.name ?? user.username ?? user.id}"`,
        `against token ${token}`,
        `Signaling Client also connected ...`,
      );
    },
    [token, user?.id],
  );

  return (
    <CallContext.Provider value={session}>{children}</CallContext.Provider>
  );
}
