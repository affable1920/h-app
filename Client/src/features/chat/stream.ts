async function* stream(content: ReadableStream<Uint8Array<ArrayBuffer>>) {
  const reader = content.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      console.log("stream finished ..");
      break;
    }

    const lines = decoder
      // decode the stream chunks to convert them to strings to be json parsed
      .decode(value, { stream: true })
      // split by "\n" -> new line character -> each \n specifies a new chunk
      .split("\n")
      // remove empty strings
      .filter(Boolean);

    for (const line of lines) {
      console.log("Unparsed chunk -> ", line);

      try {
        var chunk = JSON.parse(line) || {};
      } catch {}

      if (chunk.type === "error") {
        throw new Error(chunk.error);
      }

      if (chunk.data) {
        if (chunk.data.type === "done") {
          console.log("chunks finished streaming successfully ...");

          return;
        }

        yield chunk.data.content;
      }
    }
  }
}

export { stream };
