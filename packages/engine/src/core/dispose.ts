import {
  BufferGeometry,
  Material,
  Mesh,
  Object3D,
  Texture,
} from 'three';

/**
 * Recursively releases GPU resources owned by a Three.js subtree. The
 * editor invokes this whenever a scene node is removed so that geometry,
 * materials, and textures are not leaked after the JS reference goes away.
 */
export function disposeObject3D(root: Object3D): void {
  root.traverse((node) => {
    if ((node as Mesh).isMesh) {
      const mesh = node as Mesh;
      mesh.geometry?.dispose();
      const mat = mesh.material;
      if (Array.isArray(mat)) {
        for (const m of mat) disposeMaterial(m);
      } else if (mat) {
        disposeMaterial(mat);
      }
    }
  });
}

function disposeMaterial(material: Material): void {
  // Walk the known texture slots. `Material` exposes typed maps per slot
  // type, but a simple `as Record<string, unknown>` scan covers plugins.
  const slots = material as unknown as Record<string, unknown>;
  for (const key of Object.keys(slots)) {
    const value = slots[key];
    if (value && typeof value === 'object' && (value as { isTexture?: boolean }).isTexture) {
      (value as Texture).dispose();
    }
  }
  material.dispose();
}

export function disposeGeometry(geometry: BufferGeometry | undefined | null): void {
  geometry?.dispose();
}
