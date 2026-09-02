import { MAX_DELTA_TIME } from '@sined/shared';

export interface ClockTick {
  dt: number;
  elapsed: number;
}

/**
 * Minimal frame clock. Phase 1 will wire this into a `requestAnimationFrame`
 * loop inside `Engine`; for now it is a pure helper so it stays unit-testable
 * and Worker-portable.
 */
export class Clock {
  private last = 0;
  private elapsed = 0;
  private running = false;

  start(now = performance.now()): void {
    this.last = now;
    this.elapsed = 0;
    this.running = true;
  }

  stop(): void {
    this.running = false;
  }

  tick(now: number): ClockTick {
    if (!this.running) {
      this.start(now);
    }
    const raw = (now - this.last) / 1000;
    const dt = Math.min(raw, MAX_DELTA_TIME);
    this.last = now;
    this.elapsed += dt;
    return { dt, elapsed: this.elapsed };
  }
}
