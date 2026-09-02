/**
 * Plain-object 3-component vector utilities. Framework- and Three.js-free so
 * that domain math can run inside Web Workers without pulling the renderer.
 */
export interface Vec3Like {
  x: number;
  y: number;
  z: number;
}

export const Vec3 = {
  create(x = 0, y = 0, z = 0): Vec3Like {
    return { x, y, z };
  },
  clone(v: Vec3Like): Vec3Like {
    return { x: v.x, y: v.y, z: v.z };
  },
  add(a: Vec3Like, b: Vec3Like): Vec3Like {
    return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
  },
  sub(a: Vec3Like, b: Vec3Like): Vec3Like {
    return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
  },
  scale(v: Vec3Like, s: number): Vec3Like {
    return { x: v.x * s, y: v.y * s, z: v.z * s };
  },
  equals(a: Vec3Like, b: Vec3Like, eps = 1e-6): boolean {
    return (
      Math.abs(a.x - b.x) <= eps &&
      Math.abs(a.y - b.y) <= eps &&
      Math.abs(a.z - b.z) <= eps
    );
  },
};
