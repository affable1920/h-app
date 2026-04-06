import ReactMarkdown from "react-markdown";

function AssistantMessage({ content }: { content: string }) {
  return <ReactMarkdown>{content}</ReactMarkdown>;
}

export default AssistantMessage;
