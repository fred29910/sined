import { ComponentBase, ComponentKind } from '../components/component.js';
import { createName, NameComponent } from '../components/name.js';
import { createTransform, TransformComponent } from '../components/transform.js';
import { Uid } from '../value-objects/uid.js';
import type { SceneEvent } from '../events/scene-events.js';

export type ComponentByKind = {
  transform: TransformComponent;
  name: NameComponent;
  mesh: import('../components/mesh.js').MeshComponent;
};

export class Entity {
  readonly id: Uid;
  private readonly components: Map<ComponentKind, ComponentBase<ComponentKind>> = new Map();
  parent: Entity | null = null;
  private readonly childrenSet: Set<Entity> = new Set();
  private dispatcher: ((event: SceneEvent) => void) | null = null;

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
    this.emit({ kind: 'entity:component', entityId: this.id.value, component: component.kind, present: true });
    return this;
  }

  removeComponent(kind: ComponentKind): boolean {
    const removed = this.components.delete(kind);
    if (removed) {
      this.emit({ kind: 'entity:component', entityId: this.id.value, component: kind, present: false });
    }
    return removed;
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

  /**
   * Attach the child to this entity. Emits both a reparent event and an
   * `entity:add` event (the latter is a convenience for subscribers that
   * only care about additions, not the distinction between "new" and
   * "reparented into").
   */
  addChild(child: Entity): void {
    if (child === this) return;
    const previousParentId = child.parent?.id.value ?? null;
    if (previousParentId === this.id.value) return;
    child.parent?.detachChild(child);
    child.parent = this;
    this.childrenSet.add(child);
    this.emit({
      kind: 'entity:reparent',
      entityId: child.id.value,
      parentId: this.id.value,
      previousParentId,
    });
    this.emit({
      kind: 'entity:add',
      parentId: this.id.value,
      entityId: child.id.value,
    });
  }

  /**
   * Detach the child. The caller (typically `Scene` or a Command) is
   * expected to emit the matching `entity:remove` event; this method
   * performs only the structural change.
   */
  detachChild(child: Entity): boolean {
    if (child.parent !== this) return false;
    child.parent = null;
    this.childrenSet.delete(child);
    return true;
  }

  /**
   * Caller-friendly wrapper that performs the structural detach *and*
   * emits the matching `entity:remove` event.
   */
  removeChild(child: Entity): void {
    if (!this.detachChild(child)) return;
    this.emit({
      kind: 'entity:remove',
      parentId: this.id.value,
      entityId: child.id.value,
    });
  }

  get children(): ReadonlyArray<Entity> {
    return Array.from(this.childrenSet);
  }

  /** Called by `Scene` to wire the entity tree to the scene-wide event bus. */
  setDispatcher(dispatcher: ((event: SceneEvent) => void) | null): void {
    this.dispatcher = dispatcher;
  }

  emit(event: SceneEvent): void {
    this.dispatcher?.(event);
  }
}
