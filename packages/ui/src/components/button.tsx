import { JSX, splitProps } from 'solid-js';
import { colors, fontSize, fontWeight, radii, spacing } from '../tokens/index.js';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md';

/**
 * `'only'` swaps the padding to a square so the button can be used for
 * glyph-only triggers (e.g. a collapse caret in the Hierarchy). The caller
 * MUST supply an `aria-label` in that case.
 */
export type ButtonShape = 'default' | 'only';

export interface ButtonProps extends Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: ButtonShape;
  /** Force the icon-only square even when `shape` is not set; for one-off overrides. */
  iconOnly?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

const variantStyles: Record<ButtonVariant, JSX.CSSProperties> = {
  primary: { background: colors.accent, color: colors.white, border: `1px solid ${colors.transparent}` },
  secondary: { background: colors.surfaceAlt, color: colors.text, border: `1px solid ${colors.border}` },
  ghost: { background: colors.transparent, color: colors.text, border: `1px solid ${colors.transparent}` },
  danger: { background: colors.danger, color: colors.white, border: `1px solid ${colors.transparent}` },
};

const sizeStyles: Record<ButtonSize, JSX.CSSProperties> = {
  sm: { padding: `${spacing.xs}px ${spacing.sm}px`, 'font-size': fontSize.md },
  md: { padding: `${spacing.sm}px ${spacing.md}px`, 'font-size': fontSize.lg },
};

const iconOnlySizeStyles: Record<ButtonSize, JSX.CSSProperties> = {
  sm: { width: '20px', height: '20px', padding: '0', 'font-size': fontSize.md },
  md: { width: '28px', height: '28px', padding: '0', 'font-size': fontSize.lg },
};

export function Button(props: ButtonProps): JSX.Element {
  const [local, rest] = splitProps(props, ['variant', 'size', 'shape', 'iconOnly', 'style', 'children', 'type']);
  const variant: ButtonVariant = local.variant ?? 'secondary';
  const size: ButtonSize = local.size ?? 'md';
  const isIconOnly = (): boolean => local.shape === 'only' || local.iconOnly === true;

  return (
    <button
      type={local.type ?? 'button'}
      {...rest}
      style={{
        ...variantStyles[variant],
        ...(isIconOnly() ? iconOnlySizeStyles[size] : sizeStyles[size]),
        'border-radius': radii.sm,
        cursor: 'pointer',
        'font-family': 'inherit',
        'font-weight': fontWeight.medium,
        transition: 'background 120ms ease',
        'line-height': 1,
        display: 'inline-flex',
        'align-items': 'center',
        'justify-content': 'center',
        ...(typeof local.style === 'object' && local.style !== null ? local.style : {}),
      }}
    >
      {local.children}
    </button>
  );
}
