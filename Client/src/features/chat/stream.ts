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
      .decode(value, { stream: true })
      .split("\n")
      .filter(Boolean);

    for (const line of lines) {
      try {
        var chunk = JSON.parse(line);
      } catch {
        chunk = {};
      }

      switch (chunk.type) {
        case "error":
          throw new Error(chunk.msg);

        case "done":
          break;

        case "delta":
          yield chunk.payload.content;
      }
    }
  }
}

export { stream };
