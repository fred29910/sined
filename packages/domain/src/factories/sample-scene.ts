import { Entity } from '../entities/entity.js';
import { Scene } from '../entities/scene.js';
import { createCubeMesh } from '../components/mesh.js';
import { Uid } from '../value-objects/uid.js';

/**
 * Returns a tiny sample scene used to seed the editor on first load. The
 * factory is pure: it produces an independent `Scene` instance every call.
 * Layout matches the default `SceneRenderer` camera so the cubes are
 * centered on screen at startup.
 */
export function createSampleScene(): Scene {
  const scene = new Scene('Sample Scene');

  const root = Entity.create('World');
  root.addComponent(createCubeMesh(0x808080));
  root.getComponent('transform')!.position = { x: 0, y: 0, z: 0 };
  scene.addRoot(root);

  const cubePositions: ReadonlyArray<{ x: number; y: number; z: number; color: number; name: string }> = [
    { x: -1.5, y: 0.5, z: 0, color: 0x4f8cff, name: 'Cube · Blue' },
    { x: 1.5, y: 0.5, z: 0, color: 0xe25c5c, name: 'Cube · Red' },
    { x: 0, y: 0.5, z: -1.5, color: 0x5cc97e, name: 'Cube · Green' },
    { x: 0, y: 0.5, z: 1.5, color: 0xe2c15c, name: 'Cube · Yellow' },
  ];

  for (const spec of cubePositions) {
    const cube = Entity.create(spec.name, Uid.generate('cube'));
    cube.addComponent(createCubeMesh(spec.color));
    const transform = cube.getComponent('transform')!;
    transform.position = { x: spec.x, y: spec.y, z: spec.z };
    root.addChild(cube);
  }

  return scene;
}
