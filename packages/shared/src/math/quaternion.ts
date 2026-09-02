/**
 * Plain-object quaternion utilities. Kept framework-free so Domain / Worker
 * code can perform rotations without depending on a graphics runtime.
 */
export interface QuatLike {
  x: number;
  y: number;
  z: number;
  w: number;
}

export const Quat = {
  identity(): QuatLike {
    return { x: 0, y: 0, z: 0, w: 1 };
  },
  clone(q: QuatLike): QuatLike {
    return { x: q.x, y: q.y, z: q.z, w: q.w };
  },
  equals(a: QuatLike, b: QuatLike, eps = 1e-6): boolean {
    return (
      Math.abs(a.x - b.x) <= eps &&
      Math.abs(a.y - b.y) <= eps &&
      Math.abs(a.z - b.z) <= eps &&
      Math.abs(a.w - b.w) <= eps
    );
  },
};
