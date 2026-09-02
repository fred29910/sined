import { Uid } from '../value-objects/uid.js';
import { Entity } from './entity.js';

export class Scene {
  readonly id: Uid;
  name: string;
  private readonly roots: Set<Entity> = new Set();

  constructor(name = 'Untitled Scene', id: Uid = Uid.generate('scene')) {
    this.id = id;
    this.name = name;
  }

  addRoot(entity: Entity): void {
    entity.parent?.removeChild(entity);
    entity.parent = null;
    this.roots.add(entity);
  }

  removeRoot(entity: Entity): boolean {
    return this.roots.delete(entity);
  }

  get rootEntities(): ReadonlyArray<Entity> {
    return Array.from(this.roots);
  }
}
