import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { AnimatePresence, motion } from "motion/react";

interface ResponseProps {
  content: string;
  isStreaming: boolean;
}

function ChatResponse(response: ResponseProps) {
  return (
    <article className="prose max-w-none last:inline text-text-secondary">
      <div className="inline *:my-0">
        <ReactMarkdown
          components={{
            a({ href, ...props }) {
              return (
                <a href={href} target="_blank">
                  {props.children}
                </a>
              );
            },
            h1({ children, style, ...props }) {
              return (
                <h1
                  style={{
                    ...style,
                    color: `var(--color-text-normal)`,
                  }}
                  {...props}
                >
                  {children}
                </h1>
              );
            },
            strong({ children, ...props }) {
              return (
                <strong
                  style={{ ...props.style, color: "var(--color-text-normal" }}
                  {...props}
                >
                  {children}
                </strong>
              );
            },
          }}
          remarkPlugins={[remarkGfm, remarkBreaks]}
        >
          {response.content}
        </ReactMarkdown>
      </div>

      <AnimatePresence>
        {response.isStreaming && (
          <motion.span
            className="w-1.5 h-[1em] inline-block"
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
