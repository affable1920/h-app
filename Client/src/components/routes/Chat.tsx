import { useEffect, useRef } from "react";
import { ArrowUp, SendHorizonal, SquareStop } from "lucide-react";
import { motion } from "motion/react";
import type { APIError } from "@/types/http";
import { toast } from "sonner";
import Button from "../ui/Button";
import { useChat } from "@/hooks/chat";
import ChatResponse from "../ChatResponse";
import Badge from "../ui/Badge";
import { Stack } from "../ui/Stack";

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
      label: "Find a doctor for me",
      onClick() {
        // if (ref.current) {
        //   ref.current.value = this.label;
        // }

        sendMsg(this.label);
      },
    },

    {
      label: "locate a service",
      onClick() {
        sendMsg(this.label);
      },
    },
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
            {conversation.map((response, i) => {
              const isUser = response.role === "user";

              return (
                <Stack
                  orientation="V"
                  key={response.role + response.content + i}
                  justify={isUser ? "end" : "start"}
                >
                  <h1 className="capitalize w-fit text-text-secondary text-[14px]">
                    {response.role}
                  </h1>
                  {isUser ? (
                    <p className={`first-letter:capitalize`}>
                      {response.content as string}
                    </p>
                  ) : (
                    <ChatResponse
                      content={response.content as string}
                      isStreaming={
                        streaming &&
                        response === conversation[conversation.length - 1]
                      }
                    />
                  )}
                </Stack>
              );
            })}

            {(wrapperRef.current?.scrollTop ?? 0 + 75) >= 75 && (
              <Button
                onClick={function () {
                  wrapperRef.current?.scrollTo({ top: 0, behavior: "smooth" });
                }}
                variant="ghost"
                className="sticky self-end p-2 bottom-0 flex justify-center items-center rounded-full"
              >
                <ArrowUp size={18} />
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
        className="relative flex items-center h-16 px-4 rounded-lg shadow-lg shrink-0 
        border-2 border-border-vivid shadow-black/40 hover:ring-4 hover:ring-brand/20 
        transition-colors focus:ring-4 focus:ring-brand/20 focus-within:ring-4 focus-within:ring-brand/20"
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
        <div
          className="absolute right-6 flex items-center justify-center text-normal 
        hover:text-white w-fit"
        >
          {streaming ? (
            <Button variant="icon" onClick={stop}>
              <SquareStop size={14} />
            </Button>
          ) : (
            <Button variant="icon" onClick={sendMsg.bind(null, undefined)}>
              <SendHorizonal size={14} />
            </Button>
          )}
        </div>
      </motion.div>
    </section>
  );
}

export default Chat;
