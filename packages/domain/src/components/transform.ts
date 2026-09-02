import { Quat, QuatLike, Vec3, Vec3Like } from '@sined/shared';
import { ComponentBase } from './component.js';

export interface TransformComponent extends ComponentBase<'transform'> {
  position: Vec3Like;
  rotation: QuatLike;
  scale: Vec3Like;
}

export function createTransform(
  position: Vec3Like = Vec3.create(),
  rotation: QuatLike = Quat.identity(),
  scale: Vec3Like = Vec3.create(1, 1, 1),
): TransformComponent {
  return { kind: 'transform', position, rotation, scale };
}
