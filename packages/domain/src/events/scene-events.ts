/**
 * Domain-private change events. We intentionally use a custom listener shape
 * rather than the generic `EventBus` from `@sined/shared` so the Domain
 * public surface stays small and framework-agnostic.
 */
import type { ComponentKind } from '../components/component.js';

export interface EntitySnapshot {
  id: string;
  /** The Uid of the new parent after the change (`null` if the entity became a root). */
  parentId: string | null;
  /** The Uid of the previous parent before the change (only set for `entity:reparent`). */
  previousParentId: string | null;
}

export type SceneEvent =
  | { kind: 'root:add'; entityId: string }
  | { kind: 'root:remove'; entityId: string }
  | { kind: 'entity:add'; parentId: string | null; entityId: string }
  | { kind: 'entity:remove'; parentId: string | null; entityId: string }
  | { kind: 'entity:reparent'; entityId: string; parentId: string | null; previousParentId: string | null }
  | { kind: 'entity:component'; entityId: string; component: ComponentKind; present: boolean };

export type SceneListener = (event: SceneEvent) => void;
