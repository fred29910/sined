export const radii = {
  none: '0',
  xs: '2px',
  sm: '4px',
  md: '6px',
  lg: '8px',
  pill: '999px',
  round: '50%',
} as const;

export type RadiusToken = keyof typeof radii;
