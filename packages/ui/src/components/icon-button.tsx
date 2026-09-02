import { JSX, splitProps } from 'solid-js';
import {
  colors,
  fontSize,
  fontWeight,
  radii,
  shadows,
} from '../tokens/index.js';

export type IconButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type IconButtonSize = 'sm' | 'md';

export interface IconButtonProps
  extends Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'aria-label'> {
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  /** Required for accessibility; the button has no text label. */
  'aria-label': string;
  type?: 'button' | 'submit' | 'reset';
}

const variantStyles: Record<IconButtonVariant, JSX.CSSProperties> = {
  primary: { background: colors.accent, color: colors.white },
  secondary: { background: colors.surfaceAlt, color: colors.text, border: `1px solid ${colors.border}` },
  ghost: { background: colors.transparent, color: colors.textMuted, border: `1px solid ${colors.transparent}` },
  danger: { background: colors.danger, color: colors.white },
};

const sizeStyles: Record<IconButtonSize, JSX.CSSProperties> = {
  sm: { width: '20px', height: '20px', 'font-size': fontSize.md },
  md: { width: '26px', height: '26px', 'font-size': fontSize.lg },
};

/**
 * Square icon-only button. Always requires `aria-label`. The `children` are
 * rendered as-is (text glyph like '×' / '▾' or an inline SVG) so callers keep
 * full control over the visual mark.
 */
export function IconButton(props: IconButtonProps): JSX.Element {
  const [local, rest] = splitProps(props, ['variant', 'size', 'style', 'children']);
  const variant: IconButtonVariant = local.variant ?? 'ghost';
  const size: IconButtonSize = local.size ?? 'sm';

  return (
    <button
      type="button"
      {...rest}
      style={{
        ...variantStyles[variant],
        ...sizeStyles[size],
        'border-radius': radii.sm,
        padding: '0',
        cursor: 'pointer',
        'font-family': 'inherit',
        'font-weight': fontWeight.medium,
        'line-height': 1,
        display: 'inline-flex',
        'align-items': 'center',
        'justify-content': 'center',
        transition: 'background 120ms ease, box-shadow 120ms ease',
        'box-shadow': 'none',
        ...(typeof local.style === 'object' && local.style !== null ? local.style : {}),
      }}
      onFocus={(event) => {
        event.currentTarget.style.boxShadow = shadows.focus;
        if (typeof rest.onFocus === 'function') rest.onFocus(event);
      }}
      onBlur={(event) => {
        event.currentTarget.style.boxShadow = 'none';
        if (typeof rest.onBlur === 'function') rest.onBlur(event);
      }}
    >
      {local.children}
    </button>
  );
}
