import { For, type JSX } from 'solid-js';
import { useEditorServices } from '../../app/editor-services.js';
import { colors, spacing } from '@sined/ui';

export function Hierarchy(): JSX.Element {
  const services = useEditorServices();
  const roots = (): ReadonlyArray<{ id: string; name: string }> =>
    services.scene.rootEntities.map((e) => ({
      id: e.id.value,
      name: e.getComponent('name')?.name ?? '(unnamed)',
    }));

  return (
    <div
      data-panel="hierarchy"
      style={{
        width: '100%',
        height: '100%',
        padding: `${spacing.sm}px`,
        'box-sizing': 'border-box',
        color: colors.text,
        'font-size': '12px',
        overflow: 'auto',
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
        Scene Roots
      </div>
      <For
        each={roots()}
        fallback={
          <div style={{ color: colors.textMuted, 'font-style': 'italic' }}>
            (empty scene)
          </div>
        }
      >
        {(entity) => (
          <div
            style={{
              padding: `${spacing.xs}px ${spacing.sm}px`,
              'border-radius': '3px',
              cursor: 'default',
            }}
          >
            {entity.name}
          </div>
        )}
      </For>
    </div>
  );
}
