import APIClient from "@/services/ApiClient";
import { useEffect, useRef, useState } from "react";
import { ArrowUp, SendHorizonal } from "lucide-react";
import Code from "../ui/Code";
import { motion } from "motion/react";
import type { ChatResponse, APIError, ChatRequest } from "@/types/http";
import { toast } from "sonner";
import useAuthStore from "@/stores/authStore";
import Button from "../ui/Button";

const api = new APIClient("/chat");

function Chat() {
  const usr = useAuthStore((s) => s.user);

  const ref = useRef<HTMLInputElement>(null);
  const anchor = useRef<HTMLDivElement>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const [conversation, setConversation] = useState<
    Array<ChatRequest | ChatResponse>
  >([]);

  useEffect(
    function () {
      const wrapper = containerRef.current;

      if (wrapper) {
        wrapper.scrollTo({
          top: wrapper.scrollHeight,
          behavior: "smooth",
        });
      }
    },
    [conversation],
  );

  function clearPrompt() {
    if (ref.current) {
      ref.current.value = "";
    }
  }

  function updateConversation(role: ChatRequest["role"], message: string) {
    setConversation(function (prev) {
      return [...prev, { role, message }];
    });
  }

  async function sendMsg() {
    if (!usr) {
      toast.warning("Please login to access and chat with the assistant !");
      return;
    }

    if (!ref.current) {
      return;
    }

    let prompt = ref.current.value;

    if (!prompt.trim()) {
      toast.warning("Invalid Prompt!", {
        description: "Please enter a valid prompt",
      });

      return;
    }

    const reference = conversation;
    updateConversation("user", prompt);

    try {
      const response = await api.post<ChatResponse, ChatRequest>(undefined, {
        role: "user",
        message: prompt,
      });

      clearPrompt();

      updateConversation(response.data.role, response.data.message);
      anchor.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    } catch (ex) {
      ref.current.value = prompt;
      setConversation(reference);

      const { type, msg } = ex as APIError;
      toast.error(type, { description: msg });
    }
  }

  return (
    <section className="h-full max-h-[calc(100vh-12rem)] flex flex-col gap-10 p-4">
      <motion.section
        layout
        ref={containerRef}
        className="flex flex-col gap-12 grow overflow-y-scroll relative md:text-md"
        style={{ scrollbarWidth: "none", scrollBehavior: "smooth" }}
      >
        {conversation.map((response) => {
          const isUser = response.role === "user";
          return (
            <motion.article
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`gap-2 flex flex-col ${isUser ? "items-end" : "items-start"}`}
            >
              <Code
                size="sm"
                className="capitalize font-semibold w-fit text-sm opacity-80"
              >
                {response.role}
              </Code>
              <Code
                size="md"
                className={`first-letter:capitalize py-4 px-4 font-semibold rounded-lg`}
              >
                {response.message}
              </Code>
            </motion.article>
          );
        })}

        {(containerRef.current?.scrollHeight ?? 0) >
          window.document.documentElement.scrollHeight - 75 && (
          <Button
            onClick={function () {
              containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
            }}
            variant="ghost"
            className="sticky self-end p-2 bottom-0 flex justify-center items-center rounded-full bg-black"
          >
            <ArrowUp size={18} color="var(--color-foreground)" />
          </Button>
        )}
      </motion.section>

      <motion.div
        initial={{ scaleX: 0 }}
        animate={{
          scaleX: 1,
          transition: { duration: 0.5, damping: 17.5, stiffness: 300 },
        }}
        className="relative flex items-center border-2 border-slate-200 hover:border-secondary/40 
          hover:ring-2 transition-colors hover:ring-accent/20 focus:ring-2 focus:ring-accent/20 
          h-16 px-4 rounded-lg shadow-sm shrink-0
          focus-within:ring-3 focus-within:ring-accent/20 font-bold text-zinc-600 focus-within:border-secondary/40"
      >
        <input
          ref={ref}
          onKeyDown={function (e) {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMsg();
            }
          }}
          id="prompt"
          onChange={function (e) {
            if (ref.current) {
              ref.current.value = e.target.value;
            }
          }}
          name="prompt"
          placeholder="Ask Anything .."
          className="size-full outline-none placeholder:italic first-letter:capitalize"
        />
        <Button
          className="bg-slate-200 rounded-sm flex items-center justify-center p-2 absolute right-3"
          variant="ghost"
        >
          <SendHorizonal
            onClick={sendMsg}
            className="-rotate-90 cursor-pointer"
            size={16}
          />
        </Button>
      </motion.div>
    </section>
  );
}

export default Chat;
