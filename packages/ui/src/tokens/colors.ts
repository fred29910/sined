/**
 * Design tokens — color palette. The values are deliberately small and named
 * semantically so the editor's chrome can theme itself without touching hex
 * codes scattered through components. Phase 7 may extract these into CSS
 * variables for runtime theming; for now they are read as plain constants.
 */
export const colors = {
  // Surfaces
  bg: '#1c1f24',
  surface: '#25282e',
  surfaceAlt: '#2d3138',
  surfaceHover: '#343941',

  // Borders / dividers
  border: '#3a3f47',
  borderStrong: '#4a505a',

  // Text
  text: '#e6e8eb',
  textMuted: '#9aa0a6',
  textInverse: '#1c1f24',

  // Accent
  accent: '#4f8cff',
  accentHover: '#3a7cf0',
  accentActive: '#2f6dd6',
  accentMuted: 'rgba(79,140,255,0.18)',
  accentStrong: '#6ea1ff',

  // Status
  danger: '#e25c5c',
  dangerHover: '#d04a4a',
  warning: '#e2a85c',
  success: '#5cc97e',
  info: '#5cb8e2',

  // Overlays / shadows
  overlay: 'rgba(0,0,0,0.5)',
  shadow: 'rgba(0,0,0,0.35)',
  focus: 'rgba(79,140,255,0.45)',

  // Pure
  transparent: 'transparent',
  white: '#ffffff',
  black: '#000000',
} as const;

export type ColorToken = keyof typeof colors;

/** Convenience union for tokens that have an explicit semantic role. */
export type SemanticColor =
  | 'bg'
  | 'surface'
  | 'surfaceAlt'
  | 'border'
  | 'text'
  | 'textMuted'
  | 'accent'
  | 'danger'
  | 'success'
  | 'warning'
  | 'info';
