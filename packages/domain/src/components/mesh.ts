import { ComponentBase } from './component.js';

export type MeshKind = 'cube' | 'empty';

/**
 * Display component. Phase 1 supports two kinds:
 *   - `cube`: a 1×1×1 box mesh, color driven by `color`.
 *   - `empty`: a plain `Object3D` group node (default when no Mesh component).
 *
 * Lighting-as-an-Entity is intentionally out of scope for Phase 1; the
 * default `SceneRenderer` already provides a fixed three-point rig.
 */
export interface MeshComponent extends ComponentBase<'mesh'> {
  meshKind: MeshKind;
  /** Packed RGB integer, e.g. `0x4f8cff`. */
  color: number;
}

export function createCubeMesh(color: number): MeshComponent {
  return { kind: 'mesh', meshKind: 'cube', color };
}

export function createEmptyMesh(): MeshComponent {
  return { kind: 'mesh', meshKind: 'empty', color: 0xffffff };
}
