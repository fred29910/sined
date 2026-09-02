import { Disposable, InvariantError } from '@sined/shared';
import {
  AmbientLight,
  Color,
  DirectionalLight,
  GridHelper,
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
  cameraPosition?: { x: number; y: number; z: number };
  lookAt?: { x: number; y: number; z: number };
  withDefaultLights?: boolean;
  withGrid?: boolean;
  background?: number;
}

/**
 * Thin wrapper around `THREE.WebGLRenderer` plus a default camera/scene
 * pair. The renderer owns the fixed three-point lighting rig and grid used
 * by the editor (Phase 1); the scene graph itself is populated by
 * `SceneSync` from the Domain.
 */
export class SceneRenderer implements Disposable {
  readonly renderer: WebGLRenderer;
  readonly scene: ThreeScene;
  readonly camera: PerspectiveCamera;
  private readonly defaultHelpers: Array<{ dispose(): void }> = [];
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
    this.scene.background = new Color(opts.background ?? 0x101319);
    this.camera = new PerspectiveCamera(
      opts.fov ?? 50,
      opts.canvas.clientWidth / Math.max(1, opts.canvas.clientHeight),
      opts.near ?? 0.1,
      opts.far ?? 1000,
    );
    const camPos = opts.cameraPosition ?? { x: 6, y: 5, z: 8 };
    this.camera.position.set(camPos.x, camPos.y, camPos.z);
    const look = opts.lookAt ?? { x: 0, y: 0.5, z: 0 };
    this.camera.lookAt(look.x, look.y, look.z);

    if (opts.withDefaultLights ?? true) {
      const ambient = new AmbientLight(0xffffff, 0.4);
      this.scene.add(ambient);
      const key = new DirectionalLight(0xffffff, 1.0);
      key.position.set(5, 10, 7);
      this.scene.add(key);
      const fill = new DirectionalLight(0xffffff, 0.3);
      fill.position.set(-5, 5, -3);
      this.scene.add(fill);
      // Track them so we can dispose if needed (light dispose is a no-op
      // in current three, but we keep the contract consistent).
      this.defaultHelpers.push(ambient, key, fill);
    }

    if (opts.withGrid ?? true) {
      const grid = new GridHelper(20, 20, 0x4a4f57, 0x2c2f36);
      grid.position.y = 0;
      this.scene.add(grid);
      this.defaultHelpers.push({
        dispose() {
          const g = grid as unknown as { geometry?: { dispose?: () => void }; material?: { dispose?: () => void } | Array<{ dispose?: () => void }> };
          g.geometry?.dispose?.();
          const mat = g.material;
          if (Array.isArray(mat)) mat.forEach((m) => m.dispose?.());
          else mat?.dispose?.();
        },
      });
    }
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
    for (const helper of this.defaultHelpers) helper.dispose();
    this.defaultHelpers.length = 0;
    disposeObject3D(this.scene);
    this.renderer.dispose();
    this.disposed = true;
  }
}
