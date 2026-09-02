import { createSignal, JSX, splitProps } from 'solid-js';
import {
  colors,
  fontFamily,
  fontSize,
  radii,
  spacing,
} from '../tokens/index.js';

export interface ColorPickerProps {
  /** Hex string like `'#ff0080'` (or 3-digit shorthand). */
  value: string;
  onChange: (next: string) => void;
  ariaLabel?: string;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

/**
 * Native `<input type="color">` paired with a hex text echo. The text echo
 * is a separate visual control: it shows the current color value and lets
 * the user type a different hex (validated on commit).
 */
export function ColorPicker(props: ColorPickerProps): JSX.Element {
  const [local] = splitProps(props, ['value', 'onChange', 'ariaLabel', 'disabled', 'size']);
  const size = (): 'sm' | 'md' => local.size ?? 'md';
  const [draft, setDraft] = createSignal(local.value);
  let lastExternal = local.value;

  const syncFromExternal = (): void => {
    if (local.value !== lastExternal) {
      lastExternal = local.value;
      setDraft(local.value);
    }
  };

  const normalizeHex = (raw: string): string | null => {
    let v = raw.trim();
    if (!v.startsWith('#')) v = `#${v}`;
    if (/^#[0-9a-fA-F]{3}$/.test(v)) {
      // Expand shorthand.
      v = `#${v[1]}${v[1]}${v[2]}${v[2]}${v[3]}${v[3]}`;
    }
    if (/^#[0-9a-fA-F]{6}$/.test(v)) return v.toLowerCase();
    return null;
  };

  return (
    <div
      style={{
        display: 'inline-flex',
        'align-items': 'center',
        gap: `${spacing.xs}px`,
        opacity: local.disabled === true ? 0.5 : 1,
      }}
    >
      <input
        type="color"
        aria-label={local.ariaLabel}
        disabled={local.disabled === true}
        value={local.value}
        onInput={(event) => {
          const next = event.currentTarget.value;
          lastExternal = next;
          setDraft(next);
          local.onChange(next);
        }}
        style={{
          width: size() === 'sm' ? '24px' : '32px',
          height: size() === 'sm' ? '24px' : '32px',
          padding: '0',
          'border-radius': radii.xs,
          border: `1px solid ${colors.border}`,
          background: 'transparent',
          cursor: local.disabled === true ? 'not-allowed' : 'pointer',
          'box-shadow': 'none',
        }}
      />
      <input
        type="text"
        aria-label={local.ariaLabel ? `${local.ariaLabel} (hex)` : undefined}
        value={draft()}
        disabled={local.disabled === true}
        onFocus={syncFromExternal}
        onInput={(event) => setDraft(event.currentTarget.value)}
        onBlur={() => {
          const normalized = normalizeHex(draft());
          if (normalized && normalized !== local.value) {
            lastExternal = normalized;
            setDraft(normalized);
            local.onChange(normalized);
          } else {
            setDraft(local.value);
          }
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.currentTarget.blur();
          } else if (event.key === 'Escape') {
            setDraft(local.value);
            event.currentTarget.blur();
          }
        }}
        style={{
          background: colors.surfaceAlt,
          color: colors.text,
          border: `1px solid ${colors.border}`,
          'border-radius': radii.xs,
          padding: size() === 'sm'
            ? `${spacing.xxs}px ${spacing.xs}px`
            : `${spacing.xs}px ${spacing.sm}px`,
          'font-family': fontFamily.mono,
          'font-size': fontSize.sm,
          outline: 'none',
          width: '80px',
          'box-sizing': 'border-box',
        }}
      />
    </div>
  );
}
