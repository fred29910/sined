/**
 * Framework-agnostic, strongly-typed pub/sub bus. Listeners are called
 * synchronously in registration order. The bus is intentionally pure TS so
 * it can be reused by Domain, Engine, Editor Core, and Worker code without
 * dragging in a UI framework.
 */
// `EventMap` is intentionally a permissive constraint: any object whose
// property values can serve as listener payloads (typically interfaces with
// named event keys) qualifies. This lets each module describe its own
// strongly-typed event union without inheriting an index signature.
export type EventMap = object;
export type Listener<T> = (payload: T) => void;
export type Unsubscribe = () => void;

export class EventBus<E extends EventMap = object> {
  private readonly listeners: Map<keyof E, Set<Listener<unknown>>> = new Map();

  on<K extends keyof E>(event: K, listener: Listener<E[K]>): Unsubscribe {
    let bucket = this.listeners.get(event);
    if (!bucket) {
      bucket = new Set();
      this.listeners.set(event, bucket);
    }
    bucket.add(listener as Listener<unknown>);
    return () => {
      bucket?.delete(listener as Listener<unknown>);
    };
  }

  off<K extends keyof E>(event: K, listener: Listener<E[K]>): void {
    this.listeners.get(event)?.delete(listener as Listener<unknown>);
  }

  emit<K extends keyof E>(event: K, payload: E[K]): void {
    const bucket = this.listeners.get(event);
    if (!bucket) return;
    // Copy to allow listeners to unsubscribe during dispatch without
    // disturbing iteration.
    for (const listener of Array.from(bucket)) {
      try {
        (listener as Listener<E[K]>)(payload);
      } catch (e) {
        // A listener throwing must never break sibling subscribers.
        // eslint-disable-next-line no-console
        console.error(`[EventBus] listener for ${String(event)} threw:`, e);
      }
    }
  }

  clear(): void {
    this.listeners.clear();
  }
}
