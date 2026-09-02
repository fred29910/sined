/**
 * Motion tokens. Durations are in milliseconds (as numbers) so callers can
 * feed them into `setTimeout` / `requestAnimationFrame`; easings are CSS
 * cubic-bezier strings ready for the `transition` property.
 */
export const duration = {
  instant: 0,
  fast: 120,
  base: 180,
  slow: 280,
} as const;

export const easing = {
  linear: 'linear',
  standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
  accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',
} as const;

export type DurationToken = keyof typeof duration;
export type EasingToken = keyof typeof easing;
