export default abstract class EventEmitter extends EventTarget {
  #autoBind() {
    console.log(
      `Performing an autobind operation on methods of client [${this.className}]`,
    );

    const ownMethods = Object.getOwnPropertyDescriptors(
      Object.getPrototypeOf(this),
    );

    for (const [key, descriptor] of Object.entries(ownMethods)) {
      // object.entries returns a -> detached copy
      if (key === "constructor" || !("value" in descriptor)) {
        continue;
      }

      if (typeof descriptor.value === "function") {
        Object.defineProperty(this, key, {
          ...descriptor,
          value: descriptor.value.bind(this),
        });
      }
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

  on(
    ev: string,
    listener: (ev: CustomEvent<any>) => void,
    options: AddEventListenerOptions = {},
  ) {
    const logger = this.getLogger(`[${this.className}.on]`);
    logger(
      `Adding a listener for event of type (${ev}) on client ${this.className}...`,
    );

    this.addEventListener(ev, listener as EventListener, options);
  }

  off(ev: string, listener: (e: CustomEvent<any>) => void) {
    const logger = this.getLogger(`[${this.className}.off]`);
    logger(
      `removing a listener for event of type (${ev}) on client ${this.className}...`,
    );

    this.removeEventListener(ev, listener as EventListener);
  }

  emit(ev: string, detail?: unknown) {
    const logger = this.getLogger(`[${this.className}.emit]`);
    if (ev !== "ice-candidate") {
      logger(`Emitting event (${ev}) on client ${this.className}...`);
    }

    this.dispatchEvent(new CustomEvent(ev, { detail }));
  }

  getLogger(site: string) {
    function logger(msg: string) {
      console.log(`[${site}] ${msg}`);
    }

    return logger;
  }

  protected relay(source: EventEmitter, ev: string, as: string) {
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

    const lg = this.getLogger(`[EventEmitter.relay]`);
    lg(
      `Relay created - for event ${ev}, with ${source.className} as the source and the emitter to be ${this.className}`,
    );

    function relayImpl(this: EventEmitter) {
      this.emit(as);
    }

    source.on(ev, relayImpl.bind(this));
  }
}
