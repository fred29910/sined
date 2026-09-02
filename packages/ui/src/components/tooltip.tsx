import { JSX, Show, splitProps } from 'solid-js';
import {
  colors,
  fontSize,
  radii,
  shadows,
  spacing,
  zIndex,
} from '../tokens/index.js';

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  /** The element the tooltip wraps. The wrapper is `position: relative`. */
  children: JSX.Element;
  /** Tooltip text. If empty, the tooltip is hidden. */
  content: string;
  /** Controlled visibility. If omitted, hover/focus show the tooltip. */
  show?: boolean;
  placement?: TooltipPlacement;
  /** Optional `id` used for `aria-describedby`. */
  id?: string;
}

/**
 * Lightweight CSS-only tooltip. Wraps `children` in a `position: relative`
 * span and renders an absolutely-positioned bubble. We intentionally do not
 * use a Portal — tooltips should follow the trigger element in stacking and
 * there is no need to escape overflow contexts inside the editor chrome.
 */
export function Tooltip(props: TooltipProps): JSX.Element {
  const [local] = splitProps(props, ['children', 'content', 'show', 'placement', 'id']);
  const placement: TooltipPlacement = local.placement ?? 'top';
  const tipId = (): string => local.id ?? 'tooltip';

  const offsetStyle = (): JSX.CSSProperties => {
    switch (placement) {
      case 'top':
        return { bottom: 'calc(100% + 6px)', left: '50%', transform: 'translateX(-50%)' };
      case 'bottom':
        return { top: 'calc(100% + 6px)', left: '50%', transform: 'translateX(-50%)' };
      case 'left':
        return { right: 'calc(100% + 6px)', top: '50%', transform: 'translateY(-50%)' };
      case 'right':
        return { left: 'calc(100% + 6px)', top: '50%', transform: 'translateY(-50%)' };
    }
  };

  return (
    <span
      style={{ position: 'relative', display: 'inline-flex' }}
      aria-describedby={local.content ? tipId() : undefined}
    >
      {local.children}
      <Show when={local.show === true && local.content !== ''}>
        <div
          id={tipId()}
          role="tooltip"
          style={{
            position: 'absolute',
            'z-index': zIndex.tooltip,
            background: colors.surfaceHover,
            color: colors.text,
            'font-size': fontSize.sm,
            padding: `${spacing.xxs}px ${spacing.xs}px`,
            'border-radius': radii.xs,
            'box-shadow': shadows.md,
            'white-space': 'nowrap',
            'pointer-events': 'none',
            ...offsetStyle(),
          }}
        >
          {local.content}
        </div>
      </Show>
    </span>
  );
}
