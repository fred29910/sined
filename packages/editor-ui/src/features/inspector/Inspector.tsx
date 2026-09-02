import { type JSX } from 'solid-js';
import { colors, spacing } from '@sined/ui';
import { useEditorServices } from '../../app/editor-services.js';

export function Inspector(): JSX.Element {
  const services = useEditorServices();
  const selectedCount = (): number => services.selection.list().length;

  return (
    <div
      data-panel="inspector"
      style={{
        width: '100%',
        height: '100%',
        padding: `${spacing.md}px`,
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
        Selection
      </div>
      <div style={{ color: colors.textMuted, 'font-style': 'italic' }}>
        {selectedCount() === 0
          ? 'No selection — Phase 0 placeholder'
          : `${selectedCount()} item(s) selected`}
      </div>
    </div>
  );
}
