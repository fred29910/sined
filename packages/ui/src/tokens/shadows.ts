/**
 * Box-shadow tokens. Three tiers cover dropdowns, popovers, and modals.
 * `inner` is for pressed/inverted surfaces. `none` is the default.
 */
export const shadows = {
  none: 'none',
  sm: '0 1px 2px rgba(0,0,0,0.20)',
  md: '0 4px 8px rgba(0,0,0,0.25)',
  lg: '0 12px 28px rgba(0,0,0,0.40)',
  inner: 'inset 0 1px 2px rgba(0,0,0,0.30)',
  focus: '0 0 0 2px rgba(79,140,255,0.45)',
} as const;

export type ShadowToken = keyof typeof shadows;
