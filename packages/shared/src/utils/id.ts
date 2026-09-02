/**
 * Tiny, dependency-free unique-id generator.
 * Combines a monotonic counter with `crypto.getRandomValues` for stable
 * client-side identifiers. Used by Domain entities, SelectionManager, etc.
 */
let __counter = 0;

export function createId(prefix = 'id'): string {
  __counter = (__counter + 1) | 0;
  const random = (globalThis.crypto?.getRandomValues?.(new Uint32Array(1))[0] ?? Math.floor(Math.random() * 0xffffffff)) >>> 0;
  return `${prefix}_${random.toString(36)}_${__counter.toString(36)}`;
}
