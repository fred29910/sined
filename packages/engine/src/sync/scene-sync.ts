import { Disposable } from '@sined/shared';
import {
  BoxGeometry,
  Color,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Quaternion,
  Scene as ThreeScene,
  Vector3,
} from 'three';
import { Entity, Scene, Uid, type SceneEvent } from '@sined/domain';
import { disposeObject3D } from '../core/dispose.js';

const SHARED_BOX_GEOMETRY = new BoxGeometry(1, 1, 1);

/**
 * Bridges the Domain `Scene` (pure-TS) and a Three.js `Scene` (graphics).
 *
 * SceneSync is the **only** component that mutates `Object3D` state. The
 * UI must never call `Object3D.add` / `Object3D.remove` directly; every
 * mutation goes through a `Command` that updates the Domain, which fires
 * an event that SceneSync translates into a Three.js mutation.
 *
 * Mapping rules:
 *  - `Entity` with a `MeshComponent.meshKind === 'cube'`  →  `Mesh(BoxGeometry, MeshStandardMaterial)`
 *  - `Entity` with `MeshComponent.meshKind === 'empty'` (or no Mesh component)  →  bare `Object3D`
 *  - `NameComponent.name`  →  `Object3D.name`
 *  - `TransformComponent`  →  `Object3D.position` / `Object3D.quaternion` / `Object3D.scale`
 */
export class SceneSync implements Disposable {
  private readonly nodes = new Map<string, Object3D>();
  private readonly entityIds = new Set<string>();
  private unsubscribe: (() => void) | null = null;
  private disposed = false;

  constructor(
    private readonly scene: Scene,
    private readonly threeScene: ThreeScene,
  ) {}

  /**
   * Subscribe to scene events. Idempotent: calling `attach` twice is a no-op.
   * Returns the unsubscribe function so callers can `onCleanup(() => detach())`.
   */
  attach(): () => void {
    if (this.unsubscribe) return this.unsubscribe;
    this.unsubscribe = this.scene.addListener((event) => this.handle(event));
    this.refreshAll();
    return () => this.detach();
  }

  detach(): void {
    if (!this.unsubscribe) return;
    this.unsubscribe();
    this.unsubscribe = null;
  }

  /**
   * Force a full rebuild of the Three.js graph from the current Domain
   * state. Called automatically by `attach`, but also useful after
   * importing a saved scene.
   */
  refreshAll(): void {
    // Wipe everything except the default lights/grid that SceneRenderer owns.
    for (const child of Array.from(this.threeScene.children)) {
      // Default lights/grid are tagged by their constructor (no userData)
      // but we can identify them by their `type` to avoid disposing them.
      if (isManagedBySync(child)) {
        this.threeScene.remove(child);
        disposeObject3D(child);
      }
    }
    this.nodes.clear();
    this.entityIds.clear();

    for (const root of this.scene.rootEntities) {
      this.addSubtree(null, root);
    }
  }

  dispose(): void {
    if (this.disposed) return;
    this.detach();
    for (const [, node] of this.nodes) {
      this.threeScene.remove(node);
      disposeObject3D(node);
    }
    this.nodes.clear();
    this.entityIds.clear();
    this.disposed = true;
  }

  // -- Event handlers ----------------------------------------------------

  private handle(event: SceneEvent): void {
    if (this.disposed) return;
    switch (event.kind) {
      case 'root:add': {
        const entity = this.scene.getEntity(event.entityId);
        if (!entity) return;
        if (this.entityIds.has(event.entityId)) return; // already synced
        this.addSubtree(null, entity);
        return;
      }
      case 'entity:add': {
        const entity = this.scene.getEntity(event.entityId);
        if (!entity) return;
        if (this.entityIds.has(event.entityId)) return; // already synced
        const parent = event.parentId ? this.nodes.get(event.parentId) ?? null : null;
        this.addSubtree(parent, entity);
        return;
      }
      case 'root:remove': {
        const node = this.nodes.get(event.entityId);
        if (!node) return;
        this.removeSubtree(node);
        return;
      }
      case 'entity:remove': {
        const node = this.nodes.get(event.entityId);
        if (!node) return;
        this.removeSubtree(node);
        return;
      }
      case 'entity:reparent': {
        const node = this.nodes.get(event.entityId);
        if (!node) return;
        const newParent = event.parentId ? this.nodes.get(event.parentId) ?? null : null;
        if (node.parent !== newParent) {
          this.threeScene.remove(node);
          if (newParent) {
            newParent.add(node);
          } else {
            // Promoting to root: add to scene if not already.
            this.threeScene.add(node);
          }
        }
        return;
      }
      case 'entity:component': {
        const node = this.nodes.get(event.entityId);
        if (!node) return;
        const entity = this.scene.getEntity(event.entityId);
        if (!entity) return;
        if (event.component === 'transform') {
          if (event.present) this.writeTransform(node, entity);
        } else if (event.component === 'name') {
          if (event.present) {
            const n = entity.getComponent('name');
            if (n) node.name = n.name;
          }
        } else if (event.component === 'mesh') {
          // Rebuild the node to swap the visual representation.
          this.rebuildNode(entity);
        }
        return;
      }
    }
  }

  // -- Tree construction -------------------------------------------------

  private addSubtree(parent: Object3D | null, entity: Entity): void {
    if (this.entityIds.has(entity.id.value)) return;
    const node = this.createNode(entity);
    if (parent) {
      parent.add(node);
    } else {
      this.threeScene.add(node);
    }
    this.nodes.set(entity.id.value, node);
    this.entityIds.add(entity.id.value);
    for (const child of entity.children) {
      this.addSubtree(node, child);
    }
  }

  private removeSubtree(node: Object3D): void {
    // Recurse before removing to clean the lookup maps.
    for (const child of Array.from(node.children)) {
      this.removeSubtree(child);
    }
    const id = readEntityId(node);
    if (id) {
      this.nodes.delete(id);
      this.entityIds.delete(id);
    }
    if (node.parent) {
      node.parent.remove(node);
    } else {
      this.threeScene.remove(node);
    }
    disposeObject3D(node);
  }

  private createNode(entity: Entity): Object3D {
    const mesh = entity.getComponent('mesh');
    const name = entity.getComponent('name');
    let node: Object3D;
    if (mesh && mesh.meshKind === 'cube') {
      const material = new MeshStandardMaterial({
        color: new Color(mesh.color),
        roughness: 0.6,
        metalness: 0.1,
      });
      const meshNode = new Mesh(SHARED_BOX_GEOMETRY, material);
      node = meshNode;
    } else {
      node = new Object3D();
    }
    node.name = name?.name ?? '(unnamed)';
    node.userData.entityId = entity.id.value;
    this.writeTransform(node, entity);
    return node;
  }

  private rebuildNode(entity: Entity): void {
    const old = this.nodes.get(entity.id.value);
    if (!old) return;
    const parent = old.parent;
    const next = this.createNode(entity);
    // Copy children so we don't drop any in-flight sub-entities.
    for (const child of Array.from(old.children)) {
      old.remove(child);
      next.add(child);
    }
    if (parent) {
      parent.remove(old);
      parent.add(next);
    } else {
      this.threeScene.remove(old);
      this.threeScene.add(next);
    }
    this.nodes.set(entity.id.value, next);
    disposeObject3D(old);
  }

  private writeTransform(node: Object3D, entity: Entity): void {
    const t = entity.getComponent('transform');
    if (!t) return;
    node.position.set(t.position.x, t.position.y, t.position.z);
    node.quaternion.set(t.rotation.x, t.rotation.y, t.rotation.z, t.rotation.w);
    node.scale.set(t.scale.x, t.scale.y, t.scale.z);
  }
}

function isManagedBySync(node: Object3D): boolean {
  // Anything we created carries `userData.entityId`. Lights, camera, grid
  // helpers and the scene background do not.
  return Boolean((node.userData as { entityId?: unknown }).entityId);
}

function readEntityId(node: Object3D): string | null {
  const id = (node.userData as { entityId?: unknown }).entityId;
  if (typeof id === 'string') return id;
  if (id instanceof Uid) return id.value;
  return null;
}

// Exposed for tests / advanced consumers.
export { SHARED_BOX_GEOMETRY };

// silence the "unused import" lint when Three's types shift
void Vector3;
void Quaternion;
