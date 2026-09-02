import { For, JSX, splitProps } from 'solid-js';
import {
  colors,
  fontSize,
  radii,
  spacing,
} from '../tokens/index.js';

export interface SelectOption<T extends string | number> {
  value: T;
  label: string;
  disabled?: boolean;
}

export interface SelectProps<T extends string | number> {
  value: T;
  options: ReadonlyArray<SelectOption<T>>;
  onChange: (next: T) => void;
  ariaLabel?: string;
  size?: 'sm' | 'md';
  disabled?: boolean;
  invalid?: boolean;
  id?: string;
}

/**
 * Native `<select>` styled to match the editor chrome. We do not build a
 * custom popover here; that's reserved for a future ComboBox. Native
 * selects give us free keyboard / a11y and zero dependencies.
 */
export function Select<T extends string | number>(props: SelectProps<T>): JSX.Element {
  const [local] = splitProps(props, ['value', 'options', 'onChange', 'ariaLabel', 'size', 'disabled', 'invalid', 'id']);
  const size = (): 'sm' | 'md' => local.size ?? 'md';

  return (
    <select
      id={local.id}
      aria-label={local.ariaLabel}
      disabled={local.disabled === true}
      aria-invalid={local.invalid === true}
      value={String(local.value)}
      onChange={(event) => {
        const raw = event.currentTarget.value;
        const match = local.options.find((o) => String(o.value) === raw);
        if (match) local.onChange(match.value);
      }}
      style={{
        background: colors.surfaceAlt,
        color: colors.text,
        border: `1px solid ${local.invalid === true ? colors.danger : colors.border}`,
        'border-radius': radii.xs,
        padding: size() === 'sm'
          ? `${spacing.xxs}px ${spacing.xs}px`
          : `${spacing.xs}px ${spacing.sm}px`,
        'font-family': 'inherit',
        'font-size': size() === 'sm' ? fontSize.sm : fontSize.md,
        outline: 'none',
        cursor: local.disabled === true ? 'not-allowed' : 'pointer',
        opacity: local.disabled === true ? 0.5 : 1,
        width: '100%',
        'box-sizing': 'border-box',
      }}
    >
      <For each={local.options}>
        {(option) => (
          <option value={String(option.value)} disabled={option.disabled === true}>
            {option.label}
          </option>
        )}
      </For>
    </select>
  );
}
