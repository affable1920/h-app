import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { AnimatePresence, motion } from "motion/react";

function ChatResponse({
  content,
  isStreaming,
}: {
  content: string;
  isStreaming: boolean;
}) {
  return (
    <article className="prose max-w-none">
      <ReactMarkdown
        components={{
          a({ href, ...props }) {
            return (
              <a href={href} target="_blank">
                {props.children}
              </a>
            );
          },
        }}
        remarkPlugins={[remarkGfm, remarkBreaks]}
      >
        {content}
      </ReactMarkdown>
      <AnimatePresence>
        {isStreaming && (
          <motion.span
            className="w-1.5 h-[1em] bg-secondary inline-block align-middle ml-0.5"
            initial={{ opacity: 0 }}
            animate={{
              opacity: [1, 1, 0, 0],
              transition: {
                duration: 1,
                repeat: Infinity,
                repeatType: "loop",
                ease: "linear",
                times: [0, 0.5, 0.5, 1],
              },
            }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>
    </article>
  );
}

export default ChatResponse;
