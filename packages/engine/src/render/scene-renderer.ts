import { Disposable, InvariantError } from '@sined/shared';
import {
  PerspectiveCamera,
  Scene as ThreeScene,
  WebGLRenderer,
} from 'three';
import { disposeObject3D } from '../core/dispose.js';

export interface SceneRendererOptions {
  canvas: HTMLCanvasElement;
  fov?: number;
  near?: number;
  far?: number;
}

/**
 * Thin wrapper around `THREE.WebGLRenderer` plus a default camera/scene
 * pair. Concrete render-loop integration is wired in Phase 1; this class
 * already owns its disposal contract so callers can rely on it.
 */
export class SceneRenderer implements Disposable {
  readonly renderer: WebGLRenderer;
  readonly scene: ThreeScene;
  readonly camera: PerspectiveCamera;
  private disposed = false;

  constructor(opts: SceneRendererOptions) {
    if (!opts.canvas) {
      throw new InvariantError('SceneRenderer requires a canvas element.');
    }
    this.renderer = new WebGLRenderer({
      canvas: opts.canvas,
      antialias: true,
      alpha: false,
    });
    this.renderer.setPixelRatio(globalThis.devicePixelRatio ?? 1);
    this.scene = new ThreeScene();
    this.camera = new PerspectiveCamera(
      opts.fov ?? 60,
      opts.canvas.clientWidth / Math.max(1, opts.canvas.clientHeight),
      opts.near ?? 0.1,
      opts.far ?? 1000,
    );
  }

  resize(width: number, height: number): void {
    if (this.disposed) return;
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / Math.max(1, height);
    this.camera.updateProjectionMatrix();
  }

  render(): void {
    if (this.disposed) return;
    this.renderer.render(this.scene, this.camera);
  }

  dispose(): void {
    if (this.disposed) return;
    disposeObject3D(this.scene);
    this.renderer.dispose();
    this.disposed = true;
  }
}
