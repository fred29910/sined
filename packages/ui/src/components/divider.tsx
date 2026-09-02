import { JSX, splitProps } from 'solid-js';
import { colors } from '../tokens/index.js';

export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  /** Inset in pixels from each side along the divider's long axis. */
  inset?: number;
  /** Custom color override; defaults to `colors.border`. */
  color?: string;
}

/**
 * Thin separator. Horizontal dividers get a 1px bottom border; vertical
 * dividers get a 1px right border on a flexed full-height container.
 */
export function Divider(props: DividerProps): JSX.Element {
  const [local] = splitProps(props, ['orientation', 'inset', 'color']);
  const orientation: 'horizontal' | 'vertical' = local.orientation ?? 'horizontal';
  const isVertical = orientation === 'vertical';
  const inset = (): number => local.inset ?? 0;

  return (
    <div
      role="separator"
      aria-orientation={orientation}
      style={{
        // Horizontal: 1px line with optional horizontal insets.
        ...(isVertical
          ? {
              width: '1px',
              height: '100%',
              'align-self': 'stretch',
              'background': local.color ?? colors.border,
            }
          : {
              width: '100%',
              height: '1px',
              'background': local.color ?? colors.border,
            }),
        'margin-top': isVertical ? `${inset()}px` : '0',
        'margin-bottom': isVertical ? `${inset()}px` : '0',
        'margin-left': isVertical ? '0' : `${inset()}px`,
        'margin-right': isVertical ? '0' : `${inset()}px`,
      }}
    />
  );
}
