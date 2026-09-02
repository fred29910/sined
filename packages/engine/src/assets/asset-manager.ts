import { Disposable, RefCounted, Result, err, ok } from '@sined/shared';
import { RefCount } from '../ecs/world.js';

export type AssetId = string;
export type AssetLoader<T> = (id: AssetId) => Promise<T>;

interface Entry<T> {
  value: T;
  ref: RefCounted;
}

/**
 * Reference-counted asset cache. When a consumer calls `get`, the returned
 * wrapper's `release()` decrements the count; reaching zero frees the
 * underlying GPU resource via the provided `dispose` callback.
 */
export class AssetManager<T> implements Disposable {
  private readonly entries = new Map<AssetId, Entry<T>>();
  private readonly loaders: AssetLoader<T>[] = [];
  private disposed = false;

  registerLoader(loader: AssetLoader<T>): void {
    this.loaders.push(loader);
  }

  async get(id: AssetId): Promise<Result<{ value: T; ref: RefCounted }>> {
    if (this.disposed) return err(new Error('AssetManager disposed'));
    const existing = this.entries.get(id);
    if (existing) {
      existing.ref.retain();
      return ok({ value: existing.value, ref: existing.ref });
    }
    for (const loader of this.loaders) {
      try {
        const value = await loader(id);
        if (value === undefined || value === null) continue;
        const ref = new RefCount(() => this.unload(id));
        this.entries.set(id, { value, ref });
        return ok({ value, ref });
      } catch {
        // try the next loader
      }
    }
    return err(new Error(`No loader handled asset: ${id}`));
  }

  has(id: AssetId): boolean {
    return this.entries.has(id);
  }

  dispose(): void {
    if (this.disposed) return;
    for (const [, entry] of this.entries) {
      entry.ref.dispose();
    }
    this.entries.clear();
    this.disposed = true;
  }

  private unload(id: AssetId): void {
    this.entries.delete(id);
  }
}
