/**
 * Default engine tuning. These are intentionally simple, non-graphic values
 * so the constants stay usable from both the main thread and Web Workers.
 */
export const DEFAULT_FPS = 60;
export const DEFAULT_FIXED_DT = 1 / DEFAULT_FPS;
export const MAX_DELTA_TIME = 1 / 10; // clamp huge tab-switch deltas
