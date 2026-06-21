import { Streamdown } from "streamdown";
import remarkBreaks from "remark-breaks";

function ChatResponse({
  content,
  stream = false,
}: {
  content: string;
  stream?: boolean;
}) {
  return (
    <article>
      <Streamdown
        caret={"block"}
        remarkPlugins={[remarkBreaks]}
        isAnimating={stream}
      >
        {content}
      </Streamdown>
    </article>
  );
}

export default ChatResponse;
