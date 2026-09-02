/**
 * Typography tokens. Values are pinned to the editor's existing monospace UI
 * labels (status bar) and the default system sans for everything else.
 * Phase 7 may extend with weight and line-height scales if components need them.
 */
export const fontFamily = {
  sans: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  mono: 'ui-monospace, SFMono-Regular, Menlo, "Roboto Mono", monospace',
} as const;

export const fontSize = {
  xs: '10px',
  sm: '11px',
  md: '12px',
  lg: '14px',
  xl: '16px',
  xxl: '20px',
} as const;

export const fontWeight = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

export const lineHeight = {
  tight: 1.2,
  normal: 1.4,
  relaxed: 1.6,
} as const;

export const letterSpacing = {
  tight: '-0.01em',
  normal: '0',
  wide: '0.05em',
  wider: '0.08em',
} as const;

export type FontFamilyToken = keyof typeof fontFamily;
export type FontSizeToken = keyof typeof fontSize;
export type FontWeightToken = keyof typeof fontWeight;
export type LineHeightToken = keyof typeof lineHeight;
export type LetterSpacingToken = keyof typeof letterSpacing;
