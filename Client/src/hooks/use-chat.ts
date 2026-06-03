import { useEffect, useRef, useState } from "react";
import { makeRequest } from "@/features/chat/fetch";
import { createBuffer } from "@/features/chat/buffer";
import { stream } from "@/features/chat/stream";
import useAuthStore from "@/stores/authStore";
import APIClient from "@/services/ApiClient";
import type { ChatRequest } from "@/types/http";

// ── Constants ────────────────────────────────────────────────────────────────
const DRAIN_INTERVAL_MS = 16; // 60fps
const api = new APIClient("/chat");

type Conversation = Array<ChatRequest>;

function useChat() {
  const token = useAuthStore((s) => s.token);

  const [conversation, setConversation] = useState<Conversation>([]);
  const [streaming, setStreaming] = useState(false);

  useEffect(function () {
    async function getHistory() {
      const response = await api.get<Conversation>();

      console.log("Initial conversation state ", response.data);

      if (!!response.data) {
        setConversation(response.data);
      }
    }

    getHistory();
  }, []);

  const streamDoneRef = useRef(false);
  const controllerRef = useRef<AbortController>(null);

  function rollback(role: ChatRequest["role"]) {
    setConversation(function (prev) {
      const last = prev[prev.length - 1] ?? {};

      if (last.role === role) {
        return prev.slice(0, -1);
      } else {
        return prev;
      }
    });
  }

  function reset() {
    streamDoneRef.current = false;
    setStreaming(false);
    controllerRef.current = null;
  }

  function stop() {
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
  }

  function onChunk(chars: string) {
    setConversation(function (prev) {
      const next = [...prev];
      const last = prev[prev.length - 1] ?? {};

      if (last.role === "assistant") {
        next[next.length - 1] = {
          ...last,
          content: last.content + chars,
        };
      } else {
        next.push({
          role: "assistant",
          content: chars,
        });
      }

      return next;
    });
  }

  async function send(prompt: string) {
    if (!token) {
      return;
    }

    reset();

    const buffer = createBuffer();
    buffer.reset();

    const input = {
      role: "user" as const,
      content: prompt,
    };

    setConversation(function (prev) {
      return [...prev, input];
    });

    setStreaming(true);

    buffer.start(DRAIN_INTERVAL_MS, {
      onChunk,

      onDone() {
        streamDoneRef.current = true;
      },

      isDone() {
        return streamDoneRef.current;
      },
    });

    controllerRef.current = new AbortController();

    try {
      const response = await makeRequest(
        token,
        input,
        controllerRef.current.signal,
      );

      if (!response.ok) {
        // Rollback -> remove the user message we added to the conversation state array
        rollback("user");

        // set streaming to false for the ui to reflect it's changes
        setStreaming(false);
        controllerRef.current = null;

        // and stop the buffer -> cancel the setTimeout
        buffer.stop();
        throw new Error(response.statusText);
      }

      if (response.body) {
        for await (const chunkContent of stream(response.body)) {
          buffer.push(chunkContent);
        }
      }
    } catch (ex) {
      rollback("user");
      throw ex;
    } finally {
      setStreaming(false);
      streamDoneRef.current = true;
    }
  }

  const publicApi = {
    send,
    stop,
    conversation,
    streaming,
  };

  return publicApi;
}

export { useChat };
