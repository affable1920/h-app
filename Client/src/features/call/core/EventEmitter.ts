export default abstract class EventEmitter<
  Events extends Record<string, unknown>,
> extends EventTarget {
  #autoBind() {
    console.log(
      `Performing auto-bind operation for class ( ${this.className} )`,
    );

    const ownMethods = Object.getOwnPropertyDescriptors(
      Object.getPrototypeOf(this),
    );

    for (const [key, descriptor] of Object.entries(ownMethods)) {
      if (
        !("value" in descriptor) ||
        typeof descriptor.value !== "function" ||
        key === "constructor"
      ) {
        continue;
      }

      Object.defineProperty(this, key, {
        ...descriptor,
        value: descriptor.value.bind(this),
      });
    }
  }

  get className() {
    return this.constructor.name;
  }

  static get className() {
    return this.name;
  }

  constructor() {
    super();
    this.#autoBind();
  }

  on<K extends keyof Events & string>(
    ev: K,
    listener: (ev: CustomEvent<Events[K]>) => void,
    options: AddEventListenerOptions = {},
  ) {
    console.log(
      `[EventEmitter.on] Client (${this.className}) subscribed to event (${ev})`,
    );
    this.addEventListener(ev, listener as EventListener, options);
  }

  off<K extends keyof Events & string>(
    ev: K,
    listener: (e: CustomEvent<Events[K]>) => void,
  ) {
    this.removeEventListener(ev, listener as EventListener);
  }

  emit<K extends keyof Events & string>(ev: K, detail?: Events[K]) {
    this.dispatchEvent(new CustomEvent<Events[K]>(ev, { detail }));
  }

  getLogger(site: string) {
    function logger(msg: string) {
      console.log(`[${site}] ${msg}`);
    }

    return logger;
  }

  protected relay<
    SourceEvents extends Record<string, unknown>,
    K extends keyof SourceEvents & string,
    As extends keyof Events & string,
  >(
    source: EventEmitter<SourceEvents>,
    ev: K,
    as?: SourceEvents[K] extends Events[As] ? K : As,
  ) {
    const lg = this.getLogger(`EventEmitter.relay`);

    lg(
      `Relay created - for event ${ev}, with ${source.className} as the source and the emitter to be ${this.className}`,
    );

    const relayEv = as ?? ev;

    function relayImpl(
      this: EventEmitter<Events>,
      sourceEv: CustomEvent<SourceEvents[K]>,
    ) {
      this.emit(
        relayEv as keyof Events & string,
        sourceEv.detail as unknown as Events[keyof Events & string],
      );
    }

    source.on(ev, relayImpl.bind(this));
  }
}
