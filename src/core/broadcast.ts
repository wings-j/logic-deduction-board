/**
 * Broadcast
 */
class Broadcast {
  target = new EventTarget();
  callbacks = new WeakMap<(payload: any) => void, EventListener>();

  /**
   * On
   * @param [name] Name
   * @param [callback] Callback
   */
  on(name: string, callback: (payload: any) => void) {
    let method = (event: Event) => {
      callback((event as CustomEvent).detail);
    };
    this.callbacks.set(callback, method);

    this.target.addEventListener(name, method);
  }
  /**
   * Off
   * @param [name] Name
   * @param [callback] Callback
   */
  off(name: string, callback: (payload: any) => void) {
    let method = this.callbacks.get(callback);
    if (method) {
      this.target.removeEventListener(name, method);
    }
  }
  /**
   * Emit
   * @param [name] Name
   * @param [payload] Payload
   */
  emit(name: string, payload?: any) {
    this.target.dispatchEvent(new CustomEvent(name, { detail: payload }));
  }
}

const broadcast = new Broadcast();

export { broadcast };
