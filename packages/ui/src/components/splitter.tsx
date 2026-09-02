import { JSX, createSignal } from 'solid-js';
import { colors } from '../tokens/index.js';

export interface SplitterProps {
  orientation?: 'horizontal' | 'vertical';
  initialRatio?: number;
  onChange?: (ratio: number) => void;
}

/**
 * Minimal ratio splitter. The full feature surface (keyboard nudging,
 * double-click reset, accessible roles) lands in Phase 2; this stub is
 * enough for the Phase 0 layout shell to lay out the editor's panels.
 */
export function Splitter(props: SplitterProps): JSX.Element {
  const [dragging, setDragging] = createSignal(false);
  const ratio = () => Math.min(0.95, Math.max(0.05, props.initialRatio ?? 0.5));
  const orientation: 'horizontal' | 'vertical' = props.orientation ?? 'vertical';
  const isVertical = orientation === 'vertical';

  const handlePointerDown = (downEvent: PointerEvent): void => {
    downEvent.preventDefault();
    setDragging(true);
    const target = downEvent.currentTarget as HTMLElement;
    target.setPointerCapture(downEvent.pointerId);

    const onMove = (moveEvent: PointerEvent): void => {
      const rect = target.parentElement?.getBoundingClientRect();
      if (!rect) return;
      const position = isVertical ? moveEvent.clientX - rect.left : moveEvent.clientY - rect.top;
      const size = isVertical ? rect.width : rect.height;
      const next = size > 0 ? position / size : ratio();
      props.onChange?.(Math.min(0.95, Math.max(0.05, next)));
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
