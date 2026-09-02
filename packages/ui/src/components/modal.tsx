import {
  createEffect,
  JSX,
  onCleanup,
  Show,
  splitProps,
} from 'solid-js';
import { Portal } from 'solid-js/web';
import {
  colors,
  fontSize,
  fontWeight,
  letterSpacing,
  radii,
  shadows,
  spacing,
  zIndex,
} from '../tokens/index.js';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  /** Optional footer slot rendered below the body. */
  footer?: JSX.Element;
  children: JSX.Element;
  /** Set to `false` to disable ESC + backdrop dismiss. */
  dismissible?: boolean;
  width?: number | string;
  /** `id` for the dialog; defaults to a random value. */
  id?: string;
}

let __modalCounter = 0;

/**
 * Centered modal dialog. Renders into `document.body` via Solid's Portal so
 * it escapes local stacking contexts. Closes on ESC and (by default) on
 * backdrop click. `dismissible={false}` makes the dialog strict — only the
 * close button (if any) inside the body can dismiss.
 */
export function Modal(props: ModalProps): JSX.Element {
  const [local] = splitProps(props, [
    'open', 'onClose', 'title', 'footer', 'children', 'dismissible', 'width', 'id',
  ]);
  const id = (): string => local.id ?? `modal_${(++__modalCounter).toString(36)}`;

  const dismissible = (): boolean => local.dismissible !== false;

  // Wire keyboard listener only while open. We attach to `document` so the
  // ESC key works regardless of where focus currently is.
  createEffect(() => {
    if (!local.open) return;
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape' && dismissible()) {
        event.preventDefault();
        local.onClose();
      }
    };
    document.addEventListener('keydown', onKey);
    onCleanup(() => document.removeEventListener('keydown', onKey));
  });

  return (
    <Show when={local.open}>
      <Portal>
        <div
          style={{
            position: 'fixed',
            inset: '0',
            background: colors.overlay,
            'z-index': zIndex.modal,
            display: 'flex',
            'align-items': 'center',
            'justify-content': 'center',
            padding: `${spacing.lg}px`,
          }}
          onClick={(event) => {
            if (event.target === event.currentTarget && dismissible()) {
              local.onClose();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={local.title ? `${id()}_title` : undefined}
            id={id()}
            style={{
              background: colors.surface,
              color: colors.text,
              'border-radius': radii.md,
              'box-shadow': shadows.lg,
              'min-width': '320px',
              'max-width': '90vw',
              'max-height': '90vh',
              width: typeof local.width === 'number' ? `${local.width}px` : (local.width ?? 'auto'),
              display: 'flex',
              'flex-direction': 'column',
              overflow: 'hidden',
            }}
          >
            <Show when={local.title !== undefined}>
              <div
                style={{
                  padding: `${spacing.md}px ${spacing.lg}px`,
                  'border-bottom': `1px solid ${colors.border}`,
                  'font-size': fontSize.lg,
                  'font-weight': fontWeight.semibold,
                  'letter-spacing': letterSpacing.wide,
                  'text-transform': 'uppercase',
                  color: colors.textMuted,
                }}
                id={`${id()}_title`}
              >
                {local.title}
              </div>
            </Show>
            <div
              style={{
                padding: `${spacing.lg}px`,
                'font-size': fontSize.md,
                overflow: 'auto',
                'flex': '1 1 auto',
              }}
            >
              {local.children}
            </div>
            <Show when={local.footer !== undefined}>
              <div
                style={{
                  padding: `${spacing.md}px ${spacing.lg}px`,
                  'border-top': `1px solid ${colors.border}`,
                  background: colors.surfaceAlt,
                  display: 'flex',
                  'justify-content': 'flex-end',
                  gap: `${spacing.sm}px`,
                }}
              >
                {local.footer}
              </div>
            </Show>
          </div>
        </div>
      </Portal>
    </Show>
  );
}
