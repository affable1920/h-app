import { useEffect, useRef, useState, type InputEvent } from "react";
import { ArrowUp, SendHorizonal, SquareStop } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import Button from "../ui/Button";
import { useChat } from "@/features/chat/use-chat";
import ChatResponse from "../ChatResponse";
import Badge from "../ui/Badge";
import { Stack } from "../ui/Stack";

const templates = [
  {
    label: "book a slot for me",
  },

  {
    label: "Find a doctor for me",
  },

  {
    label: "locate a service",
  },
];

const EDITOR_CLASS = "is-empty";

function Chat() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  const [show, setShow] = useState(false);
  const { conversation, send, streaming, stop } = useChat();

  useEffect(
    function () {
      const wrapper = wrapperRef.current;

      if (!wrapper) {
        return;
      }

      wrapper.scrollTo({
        top: wrapper.scrollHeight,
        behavior: "smooth",
      });
    },
    [conversation],
  );

  useEffect(function () {
    if (editorRef.current) {
      editorRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const el = wrapperRef.current;

    if (!el) {
      return;
    }

    const onScroll = () => setShow(el.scrollTop > 20);

    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  function clearPrompt() {
    if (!editorRef.current) {
      return;
    }

    const el = editorRef.current;

    el.innerHTML = "";
    el.textContent = "";
    el.classList.add(EDITOR_CLASS);
  }

  async function sendMsg(input?: string) {
    const prompt = input || editorRef.current?.textContent.trim();

    if (!prompt) {
      return;
    }

    try {
      clearPrompt();
      await send(prompt);
    } catch (ex) {
      const el = editorRef.current as HTMLDivElement;

      el.textContent = prompt;
      el.classList.remove(EDITOR_CLASS);
      el.focus();

      const resolved = (ex as unknown as Error) || {};

      toast.error(resolved.name, {
        description() {
          return resolved.message;
        },
        duration: 2200,
      });

      // moving the cursor to the end of the restored prompt
      const range = document.createRange();
      const selection = document.getSelection();

      range.selectNodeContents(el);
      range.collapse(false);

      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }

  function handleInput(ev: InputEvent<HTMLDivElement>) {
    const el = ev.currentTarget;

    if (!el) {
      return;
    }

    if (el.innerHTML === "<br>" || el.textContent.trim() === "") {
      el.innerHTML = "";
      el.classList.add(EDITOR_CLASS);
    } else {
      el.classList.remove(EDITOR_CLASS);
    }
  }

  function handleClickIntention(ev: React.MouseEvent<HTMLFieldSetElement>) {
    const target = ev.target as Element;
    const lookouts = ["button", "svg", "i", "a"];

    // None of the look out elements should be the click event target
    const intentionFocus = lookouts.every((lo) => !target.closest(lo));

    if (intentionFocus) {
      editorRef.current?.focus();
    }
  }

  return (
    <section className="h-full max-h-[calc(100vh-12rem)] flex flex-col gap-14 p-4">
      <motion.section
        ref={wrapperRef}
        className="flex flex-col gap-14 grow overflow-y-scroll relative text-md"
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
                  <ChatResponse
                    content={response.content}
                    stream={
                      !isUser && streaming && i === conversation.length - 1
                    }
                  />
                </Stack>
              );
            })}

            {show && !streaming && (
              <Button
                variant="icon"
                bg={true}
                onClick={function () {
                  wrapperRef.current?.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="sticky self-end bottom-0 flex justify-center items-center"
              >
                <ArrowUp />
              </Button>
            )}
          </>
        ) : (
          <article className="flex flex-wrap gap-4 justify-center items-center py-4">
            {templates.map((template) => (
              <Badge
                key={template.label}
                color="primary"
                onClick={() => sendMsg(template.label)}
                className="capitalize"
                full={false}
              >
                {template.label}
              </Badge>
            ))}
          </article>
        )}
      </motion.section>

      <Stack orientation="V" className="w-full max-w-2xl mx-auto">
        <fieldset
          onClick={handleClickIntention}
          className="flex flex-col min-w-0 w-full"
        >
          {/* fieldset wraps everything and makes this component behave like a single cohesive unit */}
          <div
            //   this div adds appearance
            ref={boxRef}
            className="rounded-lg border-2 border-border-strong shadow-md shadow-black/20 hover:ring-4 
          hover:ring-brand/20 transition-colors focus:ring-4 focus:ring-brand/20 focus-within:ring-4 
          focus-within:ring-brand/20 flex flex-col"
          >
            <div
              // this box adds the necessary gaps and margins to keep the text of the editor away from the walls
              className="flex flex-col gap-4 m-3.5"
            >
              <div
                // Actual editor area with contenteditable=true, used instead of an input or textarea
                // because it behaves like an input but is still a div, so can contain other DOM elements
                // very well, like images, videos, etc
                spellCheck="false"
                ref={editorRef}
                className="editor is-empty outline-none overflow-y-auto max-h-[20rem] break-words"
                contentEditable="true"
                role="textbox"
                aria-multiline="true"
                enterKeyHint="enter"
                translate="no"
                onInput={handleInput}
                onFocus={function () {
                  boxRef.current?.focus();
                }}
                onBlur={function () {
                  boxRef.current?.blur();
                }}
                onKeyDown={function (ev) {
                  if (ev.key === "Enter" && !ev.shiftKey) {
                    ev.preventDefault();
                    sendMsg();
                  }
                }}
              />

              <Stack className="self-end [&_button]:scale-85">
                {streaming ? (
                  <Button
                    variant="icon"
                    bg={true}
                    color="secondary"
                    onClick={function () {
                      stop("Stream manually stopped by client.");
                    }}
                  >
                    <SquareStop size={14} />
                  </Button>
                ) : (
                  <Button
                    bg={true}
                    variant="icon"
                    color="white"
                    onClick={function () {
                      sendMsg();
                    }}
                  >
                    <SendHorizonal size={14} />
                  </Button>
                )}
              </Stack>
            </div>
          </div>
        </fieldset>
      </Stack>
    </section>
  );
}

export default Chat;
