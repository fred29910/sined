import { ComponentBase, ComponentKind } from '../components/component.js';
import { createName, NameComponent } from '../components/name.js';
import { createTransform, TransformComponent } from '../components/transform.js';
import { Uid } from '../value-objects/uid.js';

export type ComponentByKind = {
  transform: TransformComponent;
  name: NameComponent;
};

export class Entity {
  readonly id: Uid;
  private readonly components: Map<ComponentKind, ComponentBase<ComponentKind>> = new Map();
  parent: Entity | null = null;
  private readonly childrenSet: Set<Entity> = new Set();

  constructor(id: Uid = Uid.generate()) {
    this.id = id;
  }

  /** Convenience: every entity starts with a name + transform. */
  static create(name: string, id: Uid = Uid.generate()): Entity {
    const e = new Entity(id);
    e.addComponent(createName(name));
    e.addComponent(createTransform());
    return e;
  }

  addComponent<C extends ComponentBase<ComponentKind>>(component: C): this {
    this.components.set(component.kind, component);
    return this;
  }

  removeComponent(kind: ComponentKind): boolean {
    return this.components.delete(kind);
  }

  getComponent<K extends ComponentKind>(kind: K): ComponentByKind[K] | undefined {
    return this.components.get(kind) as ComponentByKind[K] | undefined;
  }

  hasComponent(kind: ComponentKind): boolean {
    return this.components.has(kind);
  }

  listComponents(): ReadonlyArray<ComponentBase<ComponentKind>> {
    return Array.from(this.components.values());
  }

  addChild(child: Entity): void {
    if (child.parent === this) return;
    child.parent?.removeChild(child);
    child.parent = this;
    this.childrenSet.add(child);
  }

  removeChild(child: Entity): void {
    if (child.parent !== this) return;
    child.parent = null;
    this.childrenSet.delete(child);
  }

  get children(): ReadonlyArray<Entity> {
    return Array.from(this.childrenSet);
  }
}
