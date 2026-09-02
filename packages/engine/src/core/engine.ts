import { Disposable, EventBus, getLogger } from '@sined/shared';
import { Clock } from './clock.js';
import type { SceneSync } from '../sync/scene-sync.js';
import type { SceneRenderer } from '../render/scene-renderer.js';

const log = getLogger('@sined/engine');

export interface EngineEvents {
  'engine:tick': { dt: number; elapsed: number };
  'engine:started': void;
  'engine:stopped': void;
}

export interface EngineOptions {
  /** When false, the engine runs in "headless" mode useful for tests. */
  withRenderLoop?: boolean;
}

/**
 * Owns the high-level runtime: tick loop, fixed-timestep accumulator, and
 * lifecycle for attached renderers/syncs. Concrete subsystems (renderer,
 * physics, asset pipeline) are attached via the `attach*` helpers.
 */
export class Engine implements Disposable {
  readonly events = new EventBus<EngineEvents>();
  readonly clock = new Clock();
  private rafId: number | null = null;
  private disposed = false;
  private readonly options: Required<EngineOptions>;
  private readonly renderers: Array<SceneRenderer> = [];
  private readonly renderDisposers: Array<() => void> = [];

  constructor(options: EngineOptions = {}) {
    this.options = { withRenderLoop: options.withRenderLoop ?? true };
  }

  start(): void {
    if (this.disposed) {
      throw new Error('Engine.start: cannot start a disposed engine.');
    }
    if (this.rafId !== null) return;
    this.clock.start();
    this.events.emit('engine:started', undefined);
    if (this.options.withRenderLoop && typeof requestAnimationFrame === 'function') {
      this.rafId = requestAnimationFrame(this.loop);
    } else {
      // Headless: no rAF available, the host must call `step()` manually.
      this.rafId = null;
    }
  }

  stop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.clock.stop();
    this.events.emit('engine:stopped', undefined);
  }

  /** Manual step used by headless / test hosts. */
  step(dt: number, elapsed: number): void {
    this.events.emit('engine:tick', { dt, elapsed });
  }

  /**
   * Subscribe a `SceneRenderer` to the engine's tick. Each tick triggers
   * a single `renderer.render()` call. Returns the unsubscribe function.
   */
  attachRenderer(renderer: SceneRenderer): () => void {
    this.renderers.push(renderer);
    const dispose = this.events.on('engine:tick', () => {
      try {
        renderer.render();
      } catch (e) {
        log.error('renderer threw on tick:', e);
      }
    });
    this.renderDisposers.push(dispose);
    return () => {
      dispose();
      const idx = this.renderers.indexOf(renderer);
      if (idx >= 0) this.renderers.splice(idx, 1);
      const didx = this.renderDisposers.indexOf(dispose);
      if (didx >= 0) this.renderDisposers.splice(didx, 1);
    };
  }

  /**
   * Hook a `SceneSync` to the engine's start/stop lifecycle. On start we
   * trigger a `refreshAll()` so the Three.js graph catches up to the
   * current Domain state. Returns the unsubscribe function.
   */
  attachSync(sync: SceneSync): () => void {
    const start = this.events.on('engine:started', () => sync.refreshAll());
    sync.refreshAll();
    return () => start();
  }

  dispose(): void {
    if (this.disposed) return;
    this.stop();
    for (const d of this.renderDisposers) d();
    this.renderDisposers.length = 0;
    this.renderers.length = 0;
    this.events.clear();
    this.disposed = true;
  }

  private loop = (now: number): void => {
    if (this.disposed) return;
    const { dt, elapsed } = this.clock.tick(now);
    this.events.emit('engine:tick', { dt, elapsed });
    this.rafId = requestAnimationFrame(this.loop);
  };
}
