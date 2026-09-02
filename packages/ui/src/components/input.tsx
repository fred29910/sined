import { createSignal, JSX, Show, splitProps } from 'solid-js';
import {
  colors,
  fontSize,
  fontWeight,
  radii,
  spacing,
} from '../tokens/index.js';

export type InputSize = 'sm' | 'md';

/* ------------------------------------------------------------------ TextInput */

export interface TextInputProps {
  value: string;
  onCommit: (next: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  size?: InputSize;
  invalid?: boolean;
  disabled?: boolean;
  /** Optional `id` to associate with an external `<label>`. */
  id?: string;
}

/**
 * Controlled text input that defers commits until the user finishes editing
 * (blur or Enter). Mirrors the previous `editor-ui/components/inputs.tsx`
 * behavior; Phase 2 promotes it to `@sined/ui` and adds size + invalid styles.
 */
export function TextInput(props: TextInputProps): JSX.Element {
  const [local] = splitProps(props, [
    'value', 'onCommit', 'placeholder', 'ariaLabel', 'size', 'invalid', 'disabled', 'id',
  ]);
  const [draft, setDraft] = createSignal(local.value);
  let lastExternal = local.value;

  // Re-sync the local draft when the external value changes (e.g. selection
  // switched and the same input is now editing a different entity). We only
  // re-sync on focus, otherwise we'd clobber an in-flight edit.
  const syncFromExternal = (): void => {
    if (local.value !== lastExternal) {
      lastExternal = local.value;
      setDraft(local.value);
    }
  };

  return (
    <input
      id={local.id}
      type="text"
      aria-label={local.ariaLabel}
      aria-invalid={local.invalid === true}
      placeholder={local.placeholder}
      value={draft()}
      disabled={local.disabled === true}
      onInput={(event) => setDraft(event.currentTarget.value)}
      onFocus={() => {
        syncFromExternal();
      }}
      onBlur={() => {
        if (draft() !== local.value) {
          lastExternal = draft();
          local.onCommit(draft());
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
      style={inputStyle(local.size ?? 'md', local.invalid === true)}
    />
  );
}

/* ----------------------------------------------------------------- NumberInput */

export interface NumberInputProps {
  value: number;
  onCommit: (next: number) => void;
  step?: number;
  min?: number;
  max?: number;
  ariaLabel?: string;
  size?: InputSize;
  invalid?: boolean;
  disabled?: boolean;
  /** Width override in pixels; useful for tight inspector fields. */
  width?: number;
  id?: string;
}

export function NumberInput(props: NumberInputProps): JSX.Element {
  const [local] = splitProps(props, [
    'value', 'onCommit', 'step', 'min', 'max', 'ariaLabel', 'size', 'invalid', 'disabled', 'width', 'id',
  ]);
  const [draft, setDraft] = createSignal(String(local.value));
  let lastExternal = local.value;

  const syncFromExternal = (): void => {
    if (local.value !== lastExternal) {
      lastExternal = local.value;
      setDraft(String(local.value));
    }
  };

  const clamp = (n: number): number => {
    let v = n;
    if (typeof local.min === 'number' && v < local.min) v = local.min;
    if (typeof local.max === 'number' && v > local.max) v = local.max;
    return v;
  };

  return (
    <input
      id={local.id}
      type="number"
      step={local.step ?? 0.1}
      min={local.min}
      max={local.max}
      aria-label={local.ariaLabel}
      aria-invalid={local.invalid === true}
      value={draft()}
      disabled={local.disabled === true}
      onInput={(event) => setDraft(event.currentTarget.value)}
      onFocus={syncFromExternal}
      onBlur={() => {
        const parsed = Number(draft());
        if (Number.isFinite(parsed) && parsed !== local.value) {
          const next = clamp(parsed);
          lastExternal = next;
          setDraft(String(next));
          local.onCommit(next);
        } else {
          setDraft(String(local.value));
        }
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.currentTarget.blur();
        } else if (event.key === 'Escape') {
          setDraft(String(local.value));
          event.currentTarget.blur();
        }
      }}
      style={{
        ...inputStyle(local.size ?? 'md', local.invalid === true),
        width: local.width === undefined ? '70px' : `${local.width}px`,
      }}
    />
  );
}

/* ------------------------------------------------------------------- Checkbox */

export interface CheckboxProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  indeterminate?: boolean;
  ariaLabel?: string;
  /** Optional label rendered next to the box. */
  children?: JSX.Element;
}

export function Checkbox(props: CheckboxProps): JSX.Element {
  const [local] = splitProps(props, ['checked', 'onChange', 'disabled', 'indeterminate', 'ariaLabel', 'children']);
  let inputRef: HTMLInputElement | undefined;

  // Wire the indeterminate flag imperatively (it's a DOM-only property).
  // Called from the ref callback so it runs once on mount and re-runs on
  // every change of the `indeterminate` prop.
  const syncIndeterminate = (): void => {
    if (inputRef) inputRef.indeterminate = local.indeterminate === true;
  };

  return (
    <label
      style={{
        display: 'inline-flex',
        'align-items': 'center',
        gap: `${spacing.sm}px`,
        cursor: local.disabled === true ? 'not-allowed' : 'pointer',
        color: colors.text,
        'font-size': fontSize.md,
        opacity: local.disabled === true ? 0.5 : 1,
        'user-select': 'none',
      }}
    >
      <input
        ref={(el) => {
          inputRef = el;
          syncIndeterminate();
        }}
        type="checkbox"
        aria-label={local.ariaLabel}
        checked={local.checked}
        disabled={local.disabled === true}
        onChange={(event) => local.onChange(event.currentTarget.checked)}
        style={{
          width: '14px',
          height: '14px',
          'accent-color': colors.accent,
          cursor: 'inherit',
        }}
      />
      <Show when={local.children !== undefined}>{local.children}</Show>
    </label>
  );
}

/* ------------------------------------------------------------------ Helpers */

function inputStyle(size: InputSize, invalid: boolean): JSX.CSSProperties {
  const padding = size === 'sm'
    ? `${spacing.xxs}px ${spacing.xs}px`
    : `${spacing.xs}px ${spacing.sm}px`;
  const fontSizeValue = size === 'sm' ? fontSize.sm : fontSize.md;
  return {
    background: colors.surfaceAlt,
    color: colors.text,
    border: `1px solid ${invalid ? colors.danger : colors.border}`,
    'border-radius': radii.xs,
    padding,
    'font-family': 'inherit',
    'font-size': fontSizeValue,
    'font-weight': fontWeight.normal,
    outline: 'none',
    'box-sizing': 'border-box',
    'box-shadow': 'none',
    transition: 'box-shadow 120ms ease, border-color 120ms ease',
    width: '100%',
  };
}
