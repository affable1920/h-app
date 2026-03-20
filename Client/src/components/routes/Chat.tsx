import { useState } from "react";

type AIResponse = {
  id: string;
  msg: string;
  model_name?: string;
};

type Message = {
  id: string;
  text: string;
};

const Chat = () => {
  const [msg, setMsg] = useState<string>("");
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [aiResponses, setAiResponses] = useState<AIResponse[]>([]);

  async function chatAI() {
    const newMsg: Message = {
      id: `msg-${Date.now()}-${Math.random()}`,
      text: msg,
    };
    setMsgs((p) => [...p, newMsg]);

    try {
      console.log("ai service");
    } catch (ex) {
      console.log(ex);
    } finally {
      setMsg("");
    }
  }

  const chat = "p-4 rounded-md w-fit shadow-md";

  return (
    <section className="h-1/2 flex flex-col">
      <section className="flex flex-col gap-8 grow">
        {msgs.map((message) => (
          <div key={message.id} className={`${chat} bg-gray-100 self-end`}>
            {message.text}
          </div>
        ))}
        {aiResponses.map((response) => (
          <div key={response.id} className={`${chat} bg-zinc-100`}>
            {response.msg}
          </div>
        ))}
      </section>
    </section>
  );
};

export default Chat;
