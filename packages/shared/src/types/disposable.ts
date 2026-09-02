/**
 * Anything that owns native resources (GPU buffers, event subscriptions,
 * WebSocket handles, ...) must implement `Disposable` so callers can pair
 * acquisition with deterministic cleanup.
 */
export interface Disposable {
  dispose(): void;
}

const DISPOSED = Symbol('disposed');

export interface RefCounted extends Disposable {
  refCount(): number;
  retain(): void;
  /** Returns `true` when refCount reached zero and resources were released. */
  release(): boolean;
}

export function isDisposable(value: unknown): value is Disposable {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { dispose?: unknown }).dispose === 'function'
  );
}

export const Disposed = { marker: DISPOSED } as const;
