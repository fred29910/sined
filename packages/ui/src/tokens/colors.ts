/**
 * Design tokens for the editor's UI. The values are deliberately minimal in
 * Phase 0; Phase 2 will fold in spacing, typography, and dark/light themes.
 */
export const colors = {
  bg: '#1c1f24',
  surface: '#25282e',
  surfaceAlt: '#2d3138',
  border: '#3a3f47',
  text: '#e6e8eb',
  textMuted: '#9aa0a6',
  accent: '#4f8cff',
  accentHover: '#3a7cf0',
  danger: '#e25c5c',
  success: '#5cc97e',
} as const;

export type ColorToken = keyof typeof colors;
