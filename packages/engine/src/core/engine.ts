import { Disposable, EventBus } from '@sined/shared';
import { Clock } from './clock.js';

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
 * lifecycle for the underlying renderer/workers. Concrete subsystems
 * (renderer, physics, asset pipeline) will be attached during Phase 1+.
 */
export class Engine implements Disposable {
  readonly events = new EventBus<EngineEvents>();
  readonly clock = new Clock();
  private rafId: number | null = null;
  private disposed = false;
  private readonly options: Required<EngineOptions>;

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

  dispose(): void {
    if (this.disposed) return;
    this.stop();
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
