import { Entity, Scene, Uid, type ComponentKind, type TransformComponent } from '@sined/domain';
import type { Command } from './command.js';

let __cmdCounter = 0;
function nextId(label: string): string {
  __cmdCounter = (__cmdCounter + 1) | 0;
  return `cmd_${label}_${__cmdCounter.toString(36)}`;
}

function resolveEntity(scene: Scene, ref: Uid | string): Entity {
  const id = ref instanceof Uid ? ref.value : ref;
  const entity = scene.getEntity(id);
  if (!entity) {
    throw new Error(`Command target not found: ${id}`);
  }
  return entity;
}

function resolveParent(scene: Scene, ref: Uid | string | null): Entity | null {
  if (ref === null) return null;
  return resolveEntity(scene, ref);
}

// -- AddEntityCommand ----------------------------------------------------

export interface AddEntityCommandOptions {
  scene: Scene;
  /** Uid of the new parent, or `null` to add as a root. */
  parentId: Uid | string | null;
  /** The fully-built entity to add. The command will not modify it. */
  entity: Entity;
  /** Optional index for ordering among siblings. Defaults to "append". */
  index?: number;
}

export class AddEntityCommand implements Command {
  readonly id: string;
  readonly label = 'Add entity';
  private readonly options: AddEntityCommandOptions;

  constructor(options: AddEntityCommandOptions) {
    this.options = options;
    this.id = nextId('add');
  }

  execute(): void {
    const { scene, parentId, entity, index } = this.options;
    const parent = resolveParent(scene, parentId);
    if (parent) {
      parent.addChild(entity);
    } else {
      scene.addRoot(entity);
    }
    void index; // index is purely advisory for Phase 1; parent already appends.
  }

  undo(): void {
    const { scene, parentId, entity } = this.options;
    const parent = resolveParent(scene, parentId);
    if (parent) {
      parent.removeChild(entity);
    } else {
      scene.removeRoot(entity);
    }
  }
}

// -- RemoveEntityCommand -------------------------------------------------

export interface RemoveEntityCommandOptions {
  scene: Scene;
  /**
   * The entity instance to remove. We hold the reference (not just the
   * Uid) so undo can re-attach the same instance after `removeChild`
   * detaches it from the scene graph.
   */
  entity: Entity;
}

export class RemoveEntityCommand implements Command {
  readonly id: string;
  readonly label = 'Remove entity';
  private readonly options: RemoveEntityCommandOptions;
  /** Snapshot of structural state at removal time. */
  private parentId: string | null = null;
  private removedFromRoot = false;

  constructor(options: RemoveEntityCommandOptions) {
    this.options = options;
    this.id = nextId('remove');
  }

  execute(): void {
    const entity = this.options.entity;
    const parent = entity.parent;
    if (parent) {
      this.parentId = parent.id.value;
      parent.removeChild(entity);
    } else {
      this.removedFromRoot = true;
      this.options.scene.removeRoot(entity);
    }
  }

  undo(): void {
    const { scene, entity } = this.options;
    if (this.removedFromRoot) {
      scene.addRoot(entity);
    } else if (this.parentId) {
      const parent = resolveEntity(scene, this.parentId);
      parent.addChild(entity);
    }
  }
}

// -- SetNameCommand ------------------------------------------------------

export interface SetNameCommandOptions {
  scene: Scene;
  entityId: Uid | string;
  newName: string;
}

export class SetNameCommand implements Command {
  readonly id: string;
  readonly label = 'Rename entity';
  private readonly options: SetNameCommandOptions;
  private previous: string | null = null;

  constructor(options: SetNameCommandOptions) {
    this.options = options;
    this.id = nextId('rename');
  }

  execute(): void {
    const entity = resolveEntity(this.options.scene, this.options.entityId);
    const name = entity.getComponent('name');
    if (!name) {
      throw new Error(`SetNameCommand: target has no name component (${entity.id.value})`);
    }
    this.previous = name.name;
    name.name = this.options.newName;
    // Re-emit a component change so the SceneSync can update the node name.
    entity.addComponent(name);
  }

  undo(): void {
    if (this.previous === null) return;
    const entity = resolveEntity(this.options.scene, this.options.entityId);
    const name = entity.getComponent('name');
    if (!name) return;
    name.name = this.previous;
    entity.addComponent(name);
  }
}

// -- SetTransformCommand -------------------------------------------------

export type TransformField = 'position' | 'rotation' | 'scale';

export interface SetTransformCommandOptions {
  scene: Scene;
  entityId: Uid | string;
  field: TransformField;
  value: { x: number; y: number; z: number; w?: number };
  /**
   * Optional coalesce key. When set, two consecutive SetTransformCommands
   * with the same key on the same entity + field merge — used by Phase 3
   * gizmo dragging to coalesce a multi-frame drag into a single history
   * entry. Phase 1 callers typically omit this.
   */
  coalesceKey?: string;
}

export class SetTransformCommand implements Command {
  readonly id: string;
  readonly label = 'Set transform';
  readonly coalesceKey: string | undefined;
  private readonly options: SetTransformCommandOptions;
  protected previous: { x: number; y: number; z: number; w?: number } | null = null;

  constructor(options: SetTransformCommandOptions) {
    this.options = options;
    this.id = nextId('xform');
    this.coalesceKey = options.coalesceKey;
  }

  /**
   * Construct a command that has already been "executed" and remembers
   * the value to revert to. Used by `coalesceWith` so the merged history
   * entry undoes to the state that existed *before* the first command in
   * the coalesce window.
   */
  static withRemembered(
    options: SetTransformCommandOptions,
    previous: { x: number; y: number; z: number; w?: number } | null,
  ): SetTransformCommand {
    const cmd = new SetTransformCommand(options);
    cmd.previous = previous;
    return cmd;
  }

  execute(): void {
    const entity = resolveEntity(this.options.scene, this.options.entityId);
    const transform = entity.getComponent('transform');
    if (!transform) {
      throw new Error(`SetTransformCommand: target has no transform component (${entity.id.value})`);
    }
    // Capture the previous value on the FIRST execute; on a coalesced
    // re-execute the value is already carried forward from the prior
    // command in the window.
    if (this.previous === null) {
      this.previous = cloneVec(transform, this.options.field);
    }
    applyVec(transform, this.options.field, this.options.value);
    entity.addComponent(transform);
  }

  undo(): void {
    if (!this.previous) return;
    const entity = resolveEntity(this.options.scene, this.options.entityId);
    const transform = entity.getComponent('transform');
    if (!transform) return;
    applyVec(transform, this.options.field, this.previous);
    entity.addComponent(transform);
  }

  /**
   * Merge two commands operating on the same entity + field when they
   * share a `coalesceKey`. Returns the merged command or `null` if the
   * commands cannot be combined.
   */
  coalesceWith(other: Command): Command | null {
    if (!(other instanceof SetTransformCommand)) return null;
    if (!this.coalesceKey || this.coalesceKey !== other.coalesceKey) return null;
    if (other.options.entityId !== this.options.entityId) return null;
    if (other.options.field !== this.options.field) return null;
    // Preserve `other.previous` so the merged command undoes to the
    // value before the *first* command in the coalesce window.
    return SetTransformCommand.withRemembered(
      {
        scene: this.options.scene,
        entityId: this.options.entityId,
        field: this.options.field,
        value: this.options.value,
        coalesceKey: this.coalesceKey,
      },
      other.previous,
    );
  }
}

function cloneVec(t: TransformComponent, field: TransformField): { x: number; y: number; z: number; w?: number } {
  const v = t[field];
  return { x: v.x, y: v.y, z: v.z, w: (v as { w?: number }).w };
}

function applyVec(
  t: TransformComponent,
  field: TransformField,
  value: { x: number; y: number; z: number; w?: number },
): void {
  const target = t[field] as { x: number; y: number; z: number; w?: number };
  target.x = value.x;
  target.y = value.y;
  target.z = value.z;
  if (value.w !== undefined && 'w' in target) {
    target.w = value.w;
  }
}

// -- ReparentEntityCommand -----------------------------------------------

export interface ReparentEntityCommandOptions {
  scene: Scene;
  entityId: Uid | string;
  newParentId: Uid | string | null;
}

export class ReparentEntityCommand implements Command {
  readonly id: string;
  readonly label = 'Reparent entity';
  private readonly options: ReparentEntityCommandOptions;
  private oldParentId: string | null = null;
  private wasRoot = false;

  constructor(options: ReparentEntityCommandOptions) {
    this.options = options;
    this.id = nextId('reparent');
  }

  execute(): void {
    const entity = resolveEntity(this.options.scene, this.options.entityId);
    this.oldParentId = entity.parent?.id.value ?? null;
    this.wasRoot = !entity.parent;
    if (this.oldParentId === (this.options.newParentId instanceof Uid ? this.options.newParentId.value : this.options.newParentId)) {
      return;
    }
    const newParent = resolveParent(this.options.scene, this.options.newParentId);
    if (newParent) {
      newParent.addChild(entity);
    } else {
      this.options.scene.addRoot(entity);
    }
  }

  undo(): void {
    const entity = resolveEntity(this.options.scene, this.options.entityId);
    if (this.wasRoot) {
      // It was a root before; restore to root.
      this.options.scene.addRoot(entity);
    } else if (this.oldParentId) {
      const oldParent = resolveEntity(this.options.scene, this.oldParentId);
      oldParent.addChild(entity);
    } else {
      // It had no parent at the time of the original execute? Shouldn't
      // happen — fall back to removing from current parent.
      entity.parent?.removeChild(entity);
    }
  }
}

// -- SetComponentCommand (generic) ---------------------------------------

export interface SetComponentCommandOptions<C> {
  scene: Scene;
  entityId: Uid | string;
  component: ComponentKind;
  next: C;
  apply: (entity: Entity, next: C) => void;
  revert: (entity: Entity, next: C) => void;
}

export class SetComponentCommand<C> implements Command {
  readonly id: string;
  readonly label = 'Set component';
  private readonly options: SetComponentCommandOptions<C>;

  constructor(options: SetComponentCommandOptions<C>) {
    this.options = options;
    this.id = nextId('set');
  }

  execute(): void {
    const entity = resolveEntity(this.options.scene, this.options.entityId);
    this.options.apply(entity, this.options.next);
  }

  undo(): void {
    const entity = resolveEntity(this.options.scene, this.options.entityId);
    this.options.revert(entity, this.options.next);
  }
}
