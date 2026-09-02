import { JSX, createSignal } from 'solid-js';
import { colors } from '../tokens/index.js';

export interface SplitterProps {
  orientation?: 'horizontal' | 'vertical';
  /**
   * Initial ratio used only on the first render. After the user drags,
   * subsequent ratios are derived from the cursor position.
   */
  initialRatio?: number;
  /**
   * Which side of the splitter the controlled panel is anchored to.
   *   - `'start'`: panel sits before the splitter (e.g. left or top edge).
   *               Dragging toward the panel grows it.
   *   - `'end'`:   panel sits after the splitter (e.g. right or bottom edge).
   *               Dragging toward the panel shrinks it (math is inverted).
   * Default: `'start'`.
   */
  align?: 'start' | 'end';
  /**
   * Optional reference to the panel being resized. When provided, the
   * Splitter reports the new panel size in **pixels** via `onChangePx`
   * instead of a ratio. The cursor position is measured relative to the
   * panel's own bounding box, which makes the math agnostic of where
   * the panel sits in the layout.
   */
  targetRef?: HTMLElement | null;
  /** Ratio-mode callback. */
  onChange?: (ratio: number) => void;
  /** Pixel-mode callback. Takes priority over `onChange` when both are set. */
  onChangePx?: (px: number) => void;
}

const MIN_RATIO = 0.05;
const MAX_RATIO = 0.95;

/**
 * Ratio splitter. Three modes:
 *  1. `align="start"` (default), `onChange`  → ratio = cursor / track size
 *  2. `align="end"`, `onChange`              → ratio = 1 - cursor / track size
 *  3. `targetRef` + `onChangePx`              → px = cursor - targetRect.{left|top}
 *
 * Keyboard support and double-click reset are intentionally out of scope
 * (see Phase 2 roadmap).
 */
export function Splitter(props: SplitterProps): JSX.Element {
  const [dragging, setDragging] = createSignal(false);
  const orientation: 'horizontal' | 'vertical' = props.orientation ?? 'vertical';
  const align: 'start' | 'end' = props.align ?? 'start';
  const isVertical = orientation === 'vertical';
  const pixelMode = (): boolean => Boolean(props.targetRef) && typeof props.onChangePx === 'function';

  const handlePointerDown = (downEvent: PointerEvent): void => {
    downEvent.preventDefault();
    setDragging(true);
    const target = downEvent.currentTarget as HTMLElement;
    target.setPointerCapture(downEvent.pointerId);

    const initialRatio = Math.min(MAX_RATIO, Math.max(MIN_RATIO, props.initialRatio ?? 0.5));

    const onMove = (moveEvent: PointerEvent): void => {
      if (pixelMode()) {
        const ref = props.targetRef;
        if (!ref) return;
        const rect = ref.getBoundingClientRect();
        const px = isVertical ? moveEvent.clientX - rect.left : moveEvent.clientY - rect.top;
        props.onChangePx?.(Math.max(0, px));
        return;
      }

      const trackRect = (align === 'end'
        ? target.parentElement
        : target.parentElement)?.getBoundingClientRect();
      if (!trackRect) return;
      const position = isVertical ? moveEvent.clientX - trackRect.left : moveEvent.clientY - trackRect.top;
      const size = isVertical ? trackRect.width : trackRect.height;
      if (size <= 0) {
        props.onChange?.(initialRatio);
        return;
      }
      const raw = position / size;
      const adjusted = align === 'end' ? 1 - raw : raw;
      const next = Math.min(MAX_RATIO, Math.max(MIN_RATIO, adjusted));
      props.onChange?.(next);
    };
    const onUp = (upEvent: PointerEvent): void => {
      target.releasePointerCapture(upEvent.pointerId);
      setDragging(false);
      target.removeEventListener('pointermove', onMove);
      target.removeEventListener('pointerup', onUp);
      target.removeEventListener('pointercancel', onUp);
    };
    target.addEventListener('pointermove', onMove);
    target.addEventListener('pointerup', onUp);
    target.addEventListener('pointercancel', onUp);
  };

  return (
    <div
      role="separator"
      aria-orientation={orientation}
      aria-label={align === 'end' ? 'Resize (anchor at end)' : 'Resize (anchor at start)'}
      onPointerDown={handlePointerDown}
      style={{
        flex: '0 0 4px',
        cursor: isVertical ? 'col-resize' : 'row-resize',
        background: dragging() ? colors.accent : colors.border,
        'user-select': 'none',
        'touch-action': 'none',
        transition: 'background 120ms ease',
      }}
    />
  );
}
