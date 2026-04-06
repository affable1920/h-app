import { config } from "@/config";
import useAuthStore from "@/stores/authStore";
import type { ChatRequest, ChatResponse } from "@/types/http";
import { useCallback, useRef, useState } from "react";

// ── Constants ────────────────────────────────────────────────────────────────
const CHARS_PER_CHUNK = 4;
const DRAIN_INTERVAL_MS = 16; // 60fps

export default function useChat() {
  const token = useAuthStore((s) => s.token);
  const controllerRef = useRef<AbortController>(null);

  // A flag for usage outside the hook, to differentiate between loading and unloading states
  const [ongoing, setOngoing] = useState(false);

  // Stores all characters, used to update the conversation state in intervals
  const bufferRef = useRef<string>("");

  // Stores length of characters buffered correctly till now
  const drainedRef = useRef<number>(0);

  // Holds onto the timeout ref. Ideal for cleanups
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  // Flag for use inside the hook - acts as a single source of truth
  //  to determine streaming state
  const streamDoneRef = useRef(false);

  const [conversation, setConversation] = useState<
    Array<ChatRequest | ChatResponse>
  >([]);

  const startDraining = useCallback(
    function () {
      function tick() {
        const buffer = bufferRef.current;
        const drained = drainedRef.current;

        const remaining = buffer.length - drained;

        if (remaining === 0) {
          // the buffer is empty: nothing to drain right now

          // Two possible scenarios
          if (streamDoneRef.current) {
            // 1. Stream is finished and buffer is empty - we're done
            stopDraining();
            setOngoing(false);
            return;
          }

          // 2. Stream is still open, check again next tick
          timeoutRef.current = setTimeout(tick, DRAIN_INTERVAL_MS);
          return;
        }

        // Drain N chars into state
        const chars = buffer.slice(drained, drained + CHARS_PER_CHUNK);
        drainedRef.current += chars.length;

        setConversation((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];

          if (last.role === "assistant") {
            next[next.length - 1] = {
              ...last,
              message: last.message + chars,
            };
          } else {
            next.push({ role: "assistant", message: chars });
          }

          return next;
        });
        timeoutRef.current = setTimeout(tick, DRAIN_INTERVAL_MS);
      }

      timeoutRef.current = setTimeout(tick, DRAIN_INTERVAL_MS);
    },
    [stop],
  );

  const send = useCallback(
    async function (prompt: string) {
      // Reset state before a new response
      bufferRef.current = "";
      streamDoneRef.current = false;
      drainedRef.current = 0;
      stopDraining();

      controllerRef.current = new AbortController();
      const input = { role: "user" as const, message: prompt };

      setConversation(function (prev) {
        const next = [...prev, input];
        return next;
      });

      setOngoing(true);
      startDraining();

      try {
        const response = await fetch(config.api_url + "/chat", {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },

          body: JSON.stringify(input),
          signal: controllerRef.current?.signal,
        });

        if (!response.ok) {
          stopDraining();
          setOngoing(false);
          throw new Error(response.statusText);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const stream = await reader?.read();

          if (stream?.done) {
            break;
          }

          const chunk = decoder.decode(stream?.value, { stream: true });
          bufferRef.current += chunk;
        }
      } catch (error) {
        console.log(error);
      } finally {
        // Signal drain loop that no more chunks are coming
        streamDoneRef.current = true;
      }
    },
    [startDraining, stop],
  );

  function stop() {
    if (controllerRef.current) {
      controllerRef.current.abort();
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setOngoing(false);
  }

  function stopDraining() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }

  const publicApi = {
    conversation,
    send,
    stop,
    ongoing,
  };

  return publicApi;
}
