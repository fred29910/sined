import type { JSX } from 'solid-js';
import { colors, spacing } from '@sined/ui';

/**
 * Phase 0 viewport: a styled canvas placeholder. Phase 3 will mount the
 * `Engine` here and Phase 1 will own the actual render loop.
 */
export function Viewport(): JSX.Element {
  return (
    <div
      data-panel="viewport"
      style={{
        position: 'relative',
        flex: '1 1 auto',
        background: '#0e1014',
        display: 'flex',
        'align-items': 'center',
        'justify-content': 'center',
        color: colors.textMuted,
        'font-size': '13px',
      }}
    >
      <canvas
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: `${spacing.sm}px`,
          left: `${spacing.sm}px`,
          padding: `${spacing.xs}px ${spacing.sm}px`,
          background: 'rgba(0,0,0,0.4)',
          color: colors.text,
          'border-radius': '4px',
          'font-size': '11px',
        }}
      >
        Viewport · Phase 0 placeholder
      </div>
    </div>
  );
}
