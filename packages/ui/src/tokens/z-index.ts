/**
 * Stacking context tokens. Anything that paints over the editor canvas must
 * declare its z-index here. The canvas is always 0 (default).
 */
export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  popover: 50,
  modal: 100,
  tooltip: 110,
  toast: 120,
} as const;

export type ZIndexToken = keyof typeof zIndex;
