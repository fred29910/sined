import { createSignal, For, onCleanup, type JSX } from 'solid-js';
import { colors, spacing } from '@sined/ui';
import { useEditorServices } from '../../app/editor-services.js';
import { HierarchyNode, HierarchyToolbar } from './HierarchyNode.js';

interface TreeSnapshot {
  version: number;
}

/**
 * Scene hierarchy panel. Subscribes to the editor event bus so the tree
 * re-renders whenever a Command changes the scene (add / remove / reparent
 * / component change).
 */
export function Hierarchy(): JSX.Element {
  const services = useEditorServices();
  // A monotonic version counter; we bump it on any scene mutation so the
  // `<For>` re-evaluates the root list. Phase 3 may swap this for a
  // fine-grained diff.
  const [snapshot, setSnapshot] = createSignal<TreeSnapshot>({ version: 0 });

  const refresh = (): void => { setSnapshot({ version: snapshot().version + 1 }); };

  const detach = services.eventBus.on('scene:broadcast', refresh);
  onCleanup(detach);

  return (
    <div
      data-panel="hierarchy"
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        'flex-direction': 'column',
        background: colors.surface,
        'min-height': 0,
      }}
    >
      <HierarchyToolbar />
      <div
        style={{
          flex: '1 1 auto',
          padding: `${spacing.xs}px 0`,
          'box-sizing': 'border-box',
          color: colors.text,
          'font-size': '12px',
          overflow: 'auto',
        }}
      >
        <div data-tree-version={snapshot().version} style={{ display: 'contents' }}>
          <For
            each={services.scene.rootEntities}
            fallback={
              <div style={{ padding: `${spacing.sm}px`, color: colors.textMuted, 'font-style': 'italic' }}>
                (empty scene)
              </div>
            }
          >
            {(root) => <HierarchyNode entity={root} depth={0} />}
          </For>
        </div>
      </div>
    </div>
  );
}
