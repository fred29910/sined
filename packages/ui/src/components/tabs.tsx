import {
  createContext,
  JSX,
  onCleanup,
  Show,
  splitProps,
  useContext,
} from 'solid-js';
import {
  colors,
  fontSize,
  fontWeight,
  letterSpacing,
  spacing,
} from '../tokens/index.js';

export interface TabsContextValue {
  value: () => string;
  setValue: (next: string) => void;
  baseId: string;
  register: (id: string, element: HTMLButtonElement) => void;
  unregister: (id: string) => void;
  focus: (id: string) => void;
}

const TabsCtx = createContext<TabsContextValue | undefined>(undefined);

function useTabs(component: string): TabsContextValue {
  const ctx = useContext(TabsCtx);
  if (!ctx) {
    throw new Error(`<${component}> must be rendered inside <Tabs>.`);
  }
  return ctx;
}

/* --------------------------------------------------------------------- Tabs */

export interface TabsProps {
  value: string;
  onChange: (next: string) => void;
  children: JSX.Element;
  /** Optional `id` prefix for ARIA wiring; defaults to a random value. */
  idPrefix?: string;
}

let __tabsCounter = 0;

export function Tabs(props: TabsProps): JSX.Element {
  const [local] = splitProps(props, ['value', 'onChange', 'children', 'idPrefix']);
  const baseId = `${local.idPrefix ?? 'tabs'}_${(++__tabsCounter).toString(36)}`;

  // Map of tab id → element, used for keyboard focus management.
  const elements = new Map<string, HTMLButtonElement>();
  const register = (id: string, el: HTMLButtonElement): void => {
    elements.set(id, el);
  };
  const unregister = (id: string): void => {
    elements.delete(id);
  };
  const focus = (id: string): void => {
    const el = elements.get(id);
    if (el) el.focus();
  };

  // Clean up any leftover registrations if the Tabs root unmounts.
  onCleanup(() => elements.clear());

  const ctx: TabsContextValue = {
    value: () => local.value,
    setValue: (next) => {
      if (next !== local.value) local.onChange(next);
    },
    baseId,
    register,
    unregister,
    focus,
  };

  return <TabsCtx.Provider value={ctx}>{local.children}</TabsCtx.Provider>;
}

/* ------------------------------------------------------------------ TabsList */

export interface TabsListProps {
  children: JSX.Element;
  ariaLabel?: string;
}

export function TabsList(props: TabsListProps): JSX.Element {
  const [local] = splitProps(props, ['children', 'ariaLabel']);

  return (
    <div
      role="tablist"
      aria-label={local.ariaLabel}
      style={{
        display: 'flex',
        'align-items': 'center',
        gap: `${spacing.xs}px`,
        'border-bottom': `1px solid ${colors.border}`,
        padding: `0 ${spacing.sm}px`,
        background: colors.surfaceAlt,
      }}
    >
      {local.children}
    </div>
  );
}

/* -------------------------------------------------------------------- TabsTab */

export interface TabsTabProps {
  /** Stable identifier; must match the `value` on the parent Tabs. */
  value: string;
  disabled?: boolean;
  children: JSX.Element;
}

export function TabsTab(props: TabsTabProps): JSX.Element {
  const tabs = useTabs('TabsTab');
  const [local] = splitProps(props, ['value', 'disabled', 'children']);
  const isActive = (): boolean => tabs.value() === local.value;
  const tabId = (): string => `${tabs.baseId}_tab_${local.value}`;
  const panelId = (): string => `${tabs.baseId}_panel_${local.value}`;

  const activateSelf = (): void => {
    if (local.disabled === true) return;
    tabs.setValue(local.value);
  };

  const onKeyDown = (event: KeyboardEvent): void => {
    if (local.disabled === true) return;
    const current = event.currentTarget as HTMLButtonElement | null;
    if (!current) return;
    const parent = current.parentElement;
    if (!parent) return;
    const list = Array.from(parent.querySelectorAll<HTMLButtonElement>('[role="tab"]'))
      .filter((el) => !el.hasAttribute('data-tab-disabled'));
    const myIndex = list.indexOf(current);
    if (myIndex < 0) return;

    let nextIndex: number | null = null;
    if (event.key === 'ArrowRight') nextIndex = (myIndex + 1) % list.length;
    else if (event.key === 'ArrowLeft') nextIndex = (myIndex - 1 + list.length) % list.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = list.length - 1;

    if (nextIndex !== null) {
      event.preventDefault();
      const target = list[nextIndex];
      const targetId = target.dataset.tabValue;
      if (targetId) {
        tabs.focus(targetId);
        tabs.setValue(targetId);
      }
    }
  };

  return (
    <button
      ref={(el) => {
        tabs.register(local.value, el);
      }}
      type="button"
      role="tab"
      id={tabId()}
      aria-selected={isActive()}
      aria-controls={panelId()}
      tabIndex={isActive() ? 0 : -1}
      data-tab-value={local.value}
      data-tab-disabled={local.disabled === true ? '' : undefined}
      onClick={activateSelf}
      onKeyDown={onKeyDown}
      style={{
        background: 'transparent',
        border: 'none',
        'border-bottom': `2px solid ${isActive() ? colors.accent : colors.transparent}`,
        color: isActive() ? colors.text : colors.textMuted,
        'font-family': 'inherit',
        'font-size': fontSize.md,
        'font-weight': isActive() ? fontWeight.semibold : fontWeight.normal,
        'letter-spacing': letterSpacing.wide,
        'text-transform': 'uppercase',
        padding: `${spacing.sm}px ${spacing.md}px`,
        cursor: local.disabled === true ? 'not-allowed' : 'pointer',
        opacity: local.disabled === true ? 0.4 : 1,
        transition: 'color 120ms ease, border-color 120ms ease',
      }}
    >
      {local.children}
    </button>
  );
}

/* ------------------------------------------------------------------ TabsPanel */

export interface TabsPanelProps {
  value: string;
  children: JSX.Element;
}

export function TabsPanel(props: TabsPanelProps): JSX.Element {
  const tabs = useTabs('TabsPanel');
  const [local] = splitProps(props, ['value', 'children']);
  const isActive = (): boolean => tabs.value() === local.value;
  const tabId = (): string => `${tabs.baseId}_tab_${local.value}`;
  const panelId = (): string => `${tabs.baseId}_panel_${local.value}`;

  return (
    <Show when={isActive()}>
      <div
        role="tabpanel"
        id={panelId()}
        aria-labelledby={tabId()}
        tabIndex={0}
        style={{
          padding: `${spacing.md}px`,
          color: colors.text,
        }}
      >
        {local.children}
      </div>
    </Show>
  );
}
