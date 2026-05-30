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
      try {
        var chunk = JSON.parse(line) || {};
      } catch {}

      console.log(chunk);

      switch (chunk.type) {
        case "error":
          throw new Error(chunk.error);

        case "delta":
          yield chunk.data.content;
      }
    }
  }
}

export { stream };
