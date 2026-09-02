import { EventBus, RefCounted } from '@sined/shared';
import { Entity, Uid } from '@sined/domain';

export interface WorldEvents {
  'entity:added': { id: string };
  'entity:removed': { id: string };
}

/**
 * Minimal ECS-style world. Phase 1+ will replace this with a real archetype
 * store; the public surface (add/remove/get) is already stable so consumers
 * can compile against it today.
 */
export class World {
  readonly events = new EventBus<WorldEvents>();
  private readonly entities: Map<string, Entity> = new Map();

  add(entity: Entity): Entity {
    this.entities.set(entity.id.value, entity);
    this.events.emit('entity:added', { id: entity.id.value });
    return entity;
  }

  remove(id: Uid | string): boolean {
    const key = id instanceof Uid ? id.value : id;
    const removed = this.entities.delete(key);
    if (removed) this.events.emit('entity:removed', { id: key });
    return removed;
  }

  get(id: Uid | string): Entity | undefined {
    const key = id instanceof Uid ? id.value : id;
    return this.entities.get(key);
  }

  list(): ReadonlyArray<Entity> {
    return Array.from(this.entities.values());
  }
}

/** A small helper used by `AssetManager` to keep `RefCounted` self-contained. */
export class RefCount implements RefCounted {
  private count = 1;
  private readonly onZero: () => void;
  constructor(onZero: () => void) {
    this.onZero = onZero;
  }
  refCount(): number {
    return this.count;
  }
  retain(): void {
    this.count += 1;
  }
  release(): boolean {
    this.count = Math.max(0, this.count - 1);
    if (this.count === 0) {
      this.onZero();
      return true;
    }
    return false;
  }
  dispose(): void {
    this.count = 0;
    this.onZero();
  }
}
