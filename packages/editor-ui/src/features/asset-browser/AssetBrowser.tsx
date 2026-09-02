import type { JSX } from 'solid-js';
import { colors, spacing } from '@sined/ui';

export function AssetBrowser(): JSX.Element {
  return (
    <div
      data-panel="asset-browser"
      style={{
        width: '100%',
        height: '100%',
        padding: `${spacing.sm}px`,
        'box-sizing': 'border-box',
        color: colors.text,
        'font-size': '12px',
      }}
    >
      <div
        style={{
          'text-transform': 'uppercase',
          'letter-spacing': '0.05em',
          color: colors.textMuted,
          'font-size': '10px',
          'margin-bottom': `${spacing.xs}px`,
        }}
      >
        Assets
      </div>
      <div style={{ color: colors.textMuted, 'font-style': 'italic' }}>
        Asset browser lands in Phase 5.
      </div>
    </div>
  );
}
