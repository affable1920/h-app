type TickArgs = {
  isDone: boolean;
  onDone: () => void;
  onChunk: (chunk: string) => void;
};

const CHARS_PER_CHUNK = 4;

export class Buffer {
  private buffer: { current: string };
  private drained: { current: number };
  private timer: { current: null | ReturnType<typeof setTimeout> };

  constructor(
    public readonly charsPerChunk: number = CHARS_PER_CHUNK,
    public readonly drainIntervalMS: number = 32,
  ) {
    this.buffer = { current: "" };
    this.drained = { current: 0 };
    this.timer = { current: null };
  }

  start(callbacks: TickArgs) {
    this.timer.current = setTimeout(tick.bind(this), this.drainIntervalMS);

    function tick(this: Buffer) {
      const bfr = this.buffer.current;
      const drained = this.drained.current;

      const remaining = bfr.length - drained;

      if (remaining === 0) {
        if (callbacks.isDone) {
          callbacks.onDone();

          this.stop();
          return;
        }

        this.timer.current = setTimeout(tick.bind(this));
        return;
      }

      const characters = bfr.slice(drained, drained + this.charsPerChunk);

      callbacks.onChunk(characters);
      this.drained.current += characters.length;

      this.timer.current = setTimeout(tick.bind(this), this.drainIntervalMS);
    }
  }

  stop() {
    if (this.timer.current) {
      clearTimeout(this.timer.current);
    }
  }

  reset() {
    this.stop();
    this.timer.current = null;

    this.buffer.current = "";
    this.drained.current = 0;
  }

  append(characters: string) {
    this.buffer.current += characters;
  }
}
