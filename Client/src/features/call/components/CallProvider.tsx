import { useEffect, useState, type ReactNode } from "react";
import useAuthStore, { logout } from "@/stores/auth-store";
import CallSession from "../core/CallSession";
import signalingClient from "../core/SignalingClient";
import { CallContext } from "../core/context";
import { toast } from "sonner";

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

      function listener(ev: CustomEvent) {
        const { code, message } = ev.detail.payload;

        if (code === "4444") {
          toast.info("Session expired. logging you out..");
          logout();

          return;
        }

        toast.error((code ?? "ERROR").toUpperCase(), {
          description: message,
        });
      }

      signalingClient.connect(token);
      signalingClient.on("error", listener);

      const frame = requestAnimationFrame(function () {
        setSession(new CallSession({ id: user.id, token }));
      });

      return function () {
        signalingClient.off("error", listener);
        cancelAnimationFrame(frame);
      };
    },
    [user, token],
  );

  useEffect(
    function () {
      if (!session || !(user && token)) {
        return;
      }
    },

    [session, token, user],
  );

  return (
    <CallContext.Provider value={session}>{children}</CallContext.Provider>
  );
}
