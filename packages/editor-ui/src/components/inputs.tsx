import { createSignal, type JSX } from 'solid-js';
import { colors, spacing } from '@sined/ui';

export interface TextInputProps {
  value: string;
  onCommit: (next: string) => void;
  placeholder?: string;
  ariaLabel?: string;
}

/**
 * Controlled text input that defers commits until the user finishes
 * editing (blur or Enter). Phase 1 keeps it inline here; Phase 2 will
 * promote this to `@sined/ui` with extra variants.
 */
export function TextInput(props: TextInputProps): JSX.Element {
  const [draft, setDraft] = createSignal(props.value);

  // Re-sync when the external value changes (e.g. selection switched).
  let lastExternal = props.value;
  const syncFromExternal = (): void => {
    if (props.value !== lastExternal) {
      lastExternal = props.value;
      setDraft(props.value);
    }
  };

  return (
    <input
      type="text"
      aria-label={props.ariaLabel}
      placeholder={props.placeholder}
      value={draft()}
      onInput={(event) => setDraft(event.currentTarget.value)}
      onFocus={syncFromExternal}
      onBlur={() => {
        if (draft() !== props.value) {
          lastExternal = draft();
          props.onCommit(draft());
        }
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.currentTarget.blur();
        } else if (event.key === 'Escape') {
          setDraft(props.value);
          event.currentTarget.blur();
        }
      }}
      style={inputStyle}
    />
  );
}

export interface NumberInputProps {
  value: number;
  onCommit: (next: number) => void;
  step?: number;
  ariaLabel?: string;
}

export function NumberInput(props: NumberInputProps): JSX.Element {
  const [draft, setDraft] = createSignal(String(props.value));

  let lastExternal = props.value;
  const syncFromExternal = (): void => {
    if (props.value !== lastExternal) {
      lastExternal = props.value;
      setDraft(String(props.value));
    }
  };

  return (
    <input
      type="number"
      step={props.step ?? 0.1}
      aria-label={props.ariaLabel}
      value={draft()}
      onInput={(event) => setDraft(event.currentTarget.value)}
      onFocus={syncFromExternal}
      onBlur={() => {
        const parsed = Number(draft());
        if (Number.isFinite(parsed) && parsed !== props.value) {
          lastExternal = parsed;
          props.onCommit(parsed);
        } else {
          setDraft(String(props.value));
        }
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.currentTarget.blur();
        } else if (event.key === 'Escape') {
          setDraft(String(props.value));
          event.currentTarget.blur();
        }
      }}
      style={{ ...inputStyle, width: '70px' }}
    />
  );
}

const inputStyle: JSX.CSSProperties = {
  background: colors.surfaceAlt,
  color: colors.text,
  border: `1px solid ${colors.border}`,
  'border-radius': '3px',
  padding: `${spacing.xs}px ${spacing.sm}px`,
  'font-family': 'inherit',
  'font-size': '12px',
  outline: 'none',
  width: '100%',
  'box-sizing': 'border-box',
};
