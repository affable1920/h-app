import { useEffect, useRef, useState } from "react";
import { request } from "@/features/chat/fetch";
import { Buffer } from "@/features/chat/buffer";
import { stream } from "@/features/chat/stream";
import useAuthStore from "@/stores/authStore";
import APIClient from "@/services/ApiClient";
import type { ChatRequest } from "@/types/http";
import { config } from "@/config";

const DRAIN_INTERVAL_MS = 16; // 60fps
const api = new APIClient("/chat");

type Conversation = Array<ChatRequest>;

function useChat() {
  const token = useAuthStore((s) => s.token);

  const [conversation, setConversation] = useState<Conversation>([]);
  const [streaming, setStreaming] = useState(false);

  useEffect(function () {
    // fetch history once, on first render (if any)
    getHistory();
  }, []);
  console.log(conversation);

  const streamDoneRef = useRef(false);
  const controllerRef = useRef<AbortController>(null);

  async function getHistory() {
    try {
      const response = await api.get<Conversation>();
      setConversation(response.data);
    } catch (ex) {
      console.log("Getting user history failed. logging unresolved error ", ex);
      throw ex;
    }
  }

  function rollback(role: ChatRequest["role"] = "user") {
    setConversation(function (prev) {
      const last = prev[prev.length - 1] ?? ({} as ChatRequest);

      if (last.role === role) {
        return prev.slice(0, -1);
      } else {
        return prev;
      }
    });
  }

  function reset() {
    setStreaming(false);
    controllerRef.current = null;
  }

  function stopRequest(cause?: string) {
    if (controllerRef.current) {
      controllerRef.current.abort(cause);
    }
  }

  function onChunk(chars: string) {
    setConversation(function (prev) {
      let next = [...prev];
      const last = prev[prev.length - 1] ?? ({} as ChatRequest);

      if (last.role === "assistant") {
        next[next.length - 1] = {
          ...last,
          content: last.content + chars,
        };
      } else {
        next = [...next, { role: "assistant", content: chars }];
      }

      return next;
    });
  }

  async function send(prompt: string) {
    if (!token) {
      throw new Error(
        "Not authenticated. Only premium users get access to the Assistant !",
      );
    }

    // set streaming to false and nullify previous abort controller (if any)
    reset();

    const bfr = new Buffer(4, DRAIN_INTERVAL_MS);

    bfr.reset();

    // create a user message, keep a reference - don't add directly
    const userMessage = {
      content: prompt,
      role: "user" as const,
    };

    setConversation(function (previous) {
      const next = [...previous, userMessage];
      return next;
    });

    setStreaming(true);

    // start listening for chunks before sending the request
    bfr.start({
      get isDone() {
        return streamDoneRef.current;
      },
      onChunk,
      onDone() {
        streamDoneRef.current = true;
      },
    });

    // create AbortController
    controllerRef.current = new AbortController();

    try {
      const response = await request(
        config.api_url + "/chat",
        token,
        userMessage,
        controllerRef.current.signal,
      );

      if (!response.ok) {
        (function responseNotOkay() {
          setStreaming(false);
          rollback("user");
          bfr.stop();
        })();
      }

      if (response.body) {
        for await (const chunk of stream(response.body)) {
          bfr.append(chunk);
        }
      }
    } catch (ex) {
      rollback("user");
      setStreaming(false);
      bfr.stop();
      throw ex;
    } finally {
      setStreaming(false);
    }
  }

  const publicApi = {
    send,
    stop: stopRequest,
    conversation,
    streaming,
  };

  return publicApi;
}

export { useChat };
