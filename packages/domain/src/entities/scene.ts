import { Uid } from '../value-objects/uid.js';
import { Entity } from './entity.js';
import type { SceneEvent, SceneListener } from '../events/scene-events.js';

export class Scene {
  readonly id: Uid;
  name: string;
  private readonly roots: Set<Entity> = new Set();
  private readonly listeners: Set<SceneListener> = new Set();

  constructor(name = 'Untitled Scene', id: Uid = Uid.generate('scene')) {
    this.id = id;
    this.name = name;
  }

  addRoot(entity: Entity): void {
    if (entity.parent) entity.parent.detachChild(entity);
    if (this.roots.has(entity)) return;
    this.roots.add(entity);
    this.wireEntity(entity);
    this.dispatch({ kind: 'root:add', entityId: entity.id.value });
    this.dispatch({ kind: 'entity:add', parentId: null, entityId: entity.id.value });
  }

  removeRoot(entity: Entity): boolean {
    if (!this.roots.delete(entity)) return false;
    this.unwireEntity(entity);
    this.dispatch({ kind: 'root:remove', entityId: entity.id.value });
    this.dispatch({ kind: 'entity:remove', parentId: null, entityId: entity.id.value });
    return true;
  }

  get rootEntities(): ReadonlyArray<Entity> {
    return Array.from(this.roots);
  }

  /**
   * Subscribe to all scene events. The returned function removes the
   * listener. Listeners are called synchronously in registration order.
   */
  addListener(listener: SceneListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /** Walks the entire scene in pre-order (parent first, then children). */
  walk(visitor: (entity: Entity, depth: number) => void): void {
    const recurse = (e: Entity, depth: number): void => {
      visitor(e, depth);
      for (const child of e.children) recurse(child, depth + 1);
    };
    for (const root of this.roots) recurse(root, 0);
  }

  /** Find the first entity matching the predicate, depth-first. */
  findEntity(predicate: (entity: Entity) => boolean): Entity | undefined {
    for (const root of this.roots) {
      const found = search(root, predicate);
      if (found) return found;
    }
    return undefined;
  }

  getEntity(id: string | Uid): Entity | undefined {
    const target = typeof id === 'string' ? id : id.value;
    return this.findEntity((e) => e.id.value === target);
  }

  /** Dispatch a scene event to every listener. */
  dispatch(event: SceneEvent): void {
    if (this.listeners.size === 0) return;
    for (const listener of Array.from(this.listeners)) {
      try {
        listener(event);
      } catch (e) {
        // Listener failures must not interrupt sibling subscribers.
        // eslint-disable-next-line no-console
        console.error(`[Scene] listener threw on ${event.kind}:`, e);
      }
    }
  }

  /** Wire an entity (and all its descendants) so their events bubble up. */
  private wireEntity(root: Entity): void {
    const visit = (e: Entity): void => {
      e.setDispatcher((event) => this.dispatch(event));
      for (const child of e.children) visit(child);
    };
    visit(root);
  }

  private unwireEntity(root: Entity): void {
    const visit = (e: Entity): void => {
      e.setDispatcher(null);
      for (const child of e.children) visit(child);
    };
    visit(root);
  }
}

function search(entity: Entity, predicate: (e: Entity) => boolean): Entity | undefined {
  if (predicate(entity)) return entity;
  for (const child of entity.children) {
    const found = search(child, predicate);
    if (found) return found;
  }
  return undefined;
}
