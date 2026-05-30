type TickArgs = {
  isDone: () => boolean;
  onChunk: (chunk: string) => void;
  onDone: () => void;
};

const CHARS_PER_CHUNK = 2;

function createBuffer() {
  // Stores all characters, used to update the conversation state in intervals
  const bufferRef = { current: "" };

  // Stores length of characters buffered correctly till now
  const drainedRef = { current: 0 };

  // Holds onto the timeout ref. Ideal for cleanups
  const timerRef = { current: null as ReturnType<typeof setTimeout> | null };

  function start(
    DRAIN_INTERVAL_MS: number,
    { onChunk, onDone, isDone }: TickArgs,
  ) {
    function tick() {
      const buffer = bufferRef.current;
      const drained = drainedRef.current;

      const remaining = buffer.length - drained;

      if (remaining === 0) {
        if (isDone()) {
          onDone();
          stop();
          return;
        }

        timerRef.current = setTimeout(tick, DRAIN_INTERVAL_MS);
        return;
      }

      const chars = bufferRef.current.slice(drained, drained + CHARS_PER_CHUNK);

      onChunk(chars);
      drainedRef.current += chars.length;

      timerRef.current = setTimeout(tick, DRAIN_INTERVAL_MS);
    }

    timerRef.current = setTimeout(tick, DRAIN_INTERVAL_MS);
  }

  function push(chars: string) {
    bufferRef.current += chars;
  }

  function stop() {
    // This method cleans up the timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  }

  function reset() {
    bufferRef.current = "";
    drainedRef.current = 0;
    timerRef.current = null;
  }

  const publicApi = {
    start,
    push,
    stop,
    reset,
  };

  return publicApi;
}

export { createBuffer };
