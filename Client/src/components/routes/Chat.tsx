import { useEffect, useRef } from "react";
import { ArrowUp, SendHorizonal, SquareStop } from "lucide-react";
import { motion } from "motion/react";
import type { APIError } from "@/types/http";
import { toast } from "sonner";
import Button from "../ui/Button";
import useChat from "@/hooks/chat";
import AssistantMessage from "../AssistantMessage";

function Chat() {
  const ref = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const { conversation, send, ongoing, stop } = useChat();

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

  function clearPrompt() {
    if (ref.current) {
      ref.current.value = "";
    }
  }

  async function sendMsg() {
    if (!ref.current) {
      return;
    }

    let prompt = ref.current.value;

    if (!prompt.trim()) {
      toast.warning("Invalid Prompt!");
      return;
    }

    clearPrompt();

    try {
      await send(prompt);
    } catch (ex) {
      console.log(ex);
      ref.current.value = prompt;

      const { type, msg } = ex as APIError;
      toast.error(type, { description: msg });
    }
  }

  return (
    <section className="h-full max-h-[calc(100vh-12rem)] flex flex-col gap-10 p-4">
      <motion.section
        ref={wrapperRef}
        className="flex flex-col gap-12 grow overflow-y-scroll relative"
        style={{ scrollbarWidth: "none", scrollBehavior: "smooth" }}
      >
        {conversation.map((response) => {
          const isUser = response.role === "user";

          return (
            <motion.article
              className={`flex flex-col gap-2 ${isUser ? "items-end" : "items-start"}`}
            >
              <h1 className="capitalize font-semibold w-fit opacity-80">
                {response.role}
              </h1>
              {isUser ? (
                <p
                  className={`first-letter:capitalize max-w-9/12 md:max-w-1/2`}
                >
                  {response.message}
                </p>
              ) : (
                <AssistantMessage content={response.message} />
              )}
            </motion.article>
          );
        })}

        {(wrapperRef.current?.scrollHeight ?? 0) >
          window.document.documentElement.scrollHeight - 75 && (
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
          onClick={sendMsg}
          className="size-full outline-none placeholder:italic placeholder:text-sm first-letter:capitalize"
        />
        <div className="absolute right-3 flex items-center justify-center">
          {ongoing ? (
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
              disabled={ongoing}
              onClick={sendMsg}
              className="bg-accent border-2 border-accent-dark text-white rounded-sm p-1.5"
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
