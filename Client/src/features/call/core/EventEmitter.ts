export default abstract class EventEmitter<
  Events extends Record<string, unknown>,
> extends EventTarget {
  #autoBind() {
    console.log(
      "Performing auto-bind operation for class ",
      "(" + this.className + ")",
    );

    const ownMethods = Object.getOwnPropertyDescriptors(
      Object.getPrototypeOf(this),
    );

    for (const [key, descriptor] of Object.entries(ownMethods)) {
      // object.entries returns a -> detached copy
      if (!("value" in descriptor) || typeof descriptor.value !== "function") {
        continue;
      }

      if (key === "constructor") {
        continue;
      }

      Object.defineProperty(this, key, {
        ...descriptor,
        value: descriptor.value.bind(this),
      });
    }
  }

  get className() {
    // gets the classname on an instance
    return this.constructor.name;
  }

  static get className() {
    // helper to get the client name inheriting from this class - gets the class name directly
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
    this.dispatchEvent(new CustomEvent(ev, { detail }));
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
    /* a helper function that abstracts the repititve subscription and re-emitting implementation of an 
       event - (addEventListener + handler + dispatchEvent), 
       particularly useful for events needing no transformation at all.

       (Example)
       EventName - peer-offline (try to connect with a remote peer (doctor) but he is offline)
       Normally, what this would require of us is to 
       1. subscribe to the event "peer-offline" 
       2. attach a handler for the event 
       3. Re-emit the same event - just to pass it down
       
       - repeat all 3 steps at every step inside the hierarchy chain (use-video -> call session -> rtc -> ws), 
       just so an interested party consumes it.
    */

    const lg = this.getLogger(`EventEmitter.relay`);
    lg(
      `Relay created - for event ${ev}, with ${source.className} as the source and the emitter to be ${this.className}`,
    );

    const relayEv = as ?? ev;

    function relayImpl(
      this: EventEmitter<Events>,
      sourceEv: CustomEvent<SourceEvents[K]>,
    ) {
      this.emit(relayEv as any, sourceEv.detail as any);
    }

    source.on(ev, relayImpl.bind(this));
  }
}
