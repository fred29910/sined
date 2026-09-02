import { JSX, splitProps } from 'solid-js';
import { colors, spacing } from '../tokens/index.js';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: 'sm' | 'md';
}

const variantStyles: Record<ButtonVariant, JSX.CSSProperties> = {
  primary: { background: colors.accent, color: '#fff', border: '1px solid transparent' },
  secondary: { background: colors.surfaceAlt, color: colors.text, border: `1px solid ${colors.border}` },
  ghost: { background: 'transparent', color: colors.text, border: '1px solid transparent' },
  danger: { background: colors.danger, color: '#fff', border: '1px solid transparent' },
};

const sizeStyles: Record<'sm' | 'md', JSX.CSSProperties> = {
  sm: { padding: `${spacing.xs}px ${spacing.sm}px`, 'font-size': '12px' },
  md: { padding: `${spacing.sm}px ${spacing.md}px`, 'font-size': '13px' },
};

export function Button(props: ButtonProps): JSX.Element {
  const [local, rest] = splitProps(props, ['variant', 'size', 'style', 'children']);
  const variant: ButtonVariant = local.variant ?? 'secondary';
  const size: 'sm' | 'md' = local.size ?? 'md';
  return (
    <button
      type="button"
      {...rest}
      style={{
        ...variantStyles[variant],
        ...sizeStyles[size],
        'border-radius': '4px',
        cursor: 'pointer',
        'font-family': 'inherit',
        'font-weight': 500,
        transition: 'background 120ms ease',
        ...(typeof local.style === 'object' && local.style !== null ? local.style : {}),
      }}
    >
      {local.children}
    </button>
  );
}
