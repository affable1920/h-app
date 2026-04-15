import { useEffect, useRef } from "react";
import { ArrowUp, SendHorizonal, SquareStop } from "lucide-react";
import { motion } from "motion/react";
import type { APIError } from "@/types/http";
import { toast } from "sonner";
import Button from "../ui/Button";
import { useChat } from "@/hooks/chat";
import ChatResponse from "../ChatResponse";
import Badge from "../ui/Badge";

function Chat() {
  const ref = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const { conversation, send, streaming, stop } = useChat();

  useEffect(function () {
    if (ref.current) {
      ref.current?.focus();
    }
  }, []);

  useEffect(
    function () {
      const wrapper = wrapperRef.current;

      if (wrapper) {
        wrapper.scrollTo({
          top: wrapper.scrollHeight,
          behavior: "smooth",
        });
      }
    },
    [conversation],
  );

  const templates = [
    {
      label: "book a slot for me",
      onClick() {
        sendMsg(this.label);
      },
    },

    {
      label: "Find a cardiologist for me",
      onClick() {
        sendMsg(this.label);
      },
    },

    { label: "ask about medication" },
    { label: "get a quick diagnosis" },

    { label: "locate a service" },
  ];

  function clearPrompt() {
    if (ref.current) {
      ref.current.value = "";
    }
  }

  async function sendMsg(input?: string) {
    const prompt = input || ref.current?.value.trim();

    if (!prompt) {
      return;
    }

    try {
      clearPrompt();
      await send(prompt);
    } catch (ex) {
      (ref.current as HTMLInputElement).value = prompt;
      const message = (ex as Error).message || (ex as APIError).msg;
      toast.message(message);
    }
  }

  return (
    <section className="h-full max-h-[calc(100vh-12rem)] flex flex-col gap-10 p-4">
      <motion.section
        ref={wrapperRef}
        className="flex flex-col gap-14 grow overflow-y-scroll relative text-md leading-[1.2] "
        style={{ scrollbarWidth: "none", scrollBehavior: "smooth" }}
      >
        {!!conversation.length ? (
          <>
            {conversation.map((response) => {
              const isUser = response.role === "user";

              return (
                <motion.article
                  key={response.role + response.message}
                  className={`flex flex-col gap-2 ${isUser ? "items-end" : "items-start"}`}
                >
                  <h1 className="capitalize font-semibold w-fit opacity-80">
                    {response.role}
                  </h1>
                  {isUser ? (
                    <p className={`first-letter:capitalize`}>
                      {response.message}
                    </p>
                  ) : (
                    <ChatResponse
                      content={response.message}
                      isStreaming={
                        streaming &&
                        response === conversation[conversation.length - 1]
                      }
                    />
                  )}
                </motion.article>
              );
            })}

            {(wrapperRef.current?.scrollTop ?? 0 + 75) >= 75 && (
              <Button
                onClick={function () {
                  wrapperRef.current?.scrollTo({ top: 0, behavior: "smooth" });
                }}
                variant="ghost"
                className="sticky self-end p-2 bottom-0 flex justify-center items-center rounded-full bg-black"
              >
                <ArrowUp size={18} color="var(--color-foreground)" />
              </Button>
            )}
          </>
        ) : (
          <article className="flex flex-wrap gap-4 justify-center items-center py-4">
            {templates.map((template) => (
              <Badge
                key={template.label}
                size="md"
                onClick={template.onClick?.bind(template)}
                full={false}
              >
                {template.label}
              </Badge>
            ))}
          </article>
        )}
      </motion.section>

      <motion.div
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
          className="size-full outline-none placeholder:italic placeholder:text-sm first-letter:capitalize"
        />
        <div className="absolute right-3 flex items-center justify-center">
          {streaming ? (
            <Button
              className="bg-secondary border-2 border-secondary-dark text-gray-300 rounded-sm p-1.5"
              variant="ghost"
              onClick={stop}
            >
              <SquareStop size={14} />
            </Button>
          ) : (
            <Button
              variant="ghost"
              onClick={sendMsg.bind(null, undefined)}
              className="bg-accent text-white rounded-sm p-2"
            >
              <SendHorizonal size={14} />
            </Button>
          )}
        </div>
      </motion.div>
    </section>
  );
}

export default Chat;
