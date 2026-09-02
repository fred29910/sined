import { createMemo, createSignal, For, Show, type JSX } from 'solid-js';
import { Button, colors, spacing } from '@sined/ui';
import { useEditorServices } from '../../app/editor-services.js';
import { createCubeMesh, Entity, Uid, type Entity as EntityType } from '@sined/domain';

export interface HierarchyNodeProps {
  entity: Entity;
  depth: number;
}

/**
 * Recursive tree row. Local collapse state and memoized child list.
 * The component is purely presentational; mutations go through
 * `services.commands` so the change passes through the history stack.
 */
export function HierarchyNode(props: HierarchyNodeProps): JSX.Element {
  const services = useEditorServices();
  const [expanded, setExpanded] = createSignal(true);

  const name = (): string => props.entity.getComponent('name')?.name ?? '(unnamed)';
  const childEntities = (): ReadonlyArray<Entity> => props.entity.children;
  const hasChildren = (): boolean => childEntities().length > 0;

  const isSelected = createMemo(() => services.selection.isSelected(props.entity.id.value));

  return (
    <div>
      <div
        onClick={(event) => {
          event.stopPropagation();
          services.selection.select(props.entity.id.value, event.shiftKey ? 'add' : 'replace');
        }}
        style={{
          display: 'flex',
          'align-items': 'center',
          gap: `${spacing.xs}px`,
          padding: `${spacing.xs}px ${spacing.sm}px`,
          'padding-left': `${spacing.sm + props.depth * 14}px`,
          background: isSelected() ? 'rgba(79,140,255,0.25)' : 'transparent',
          'border-radius': '3px',
          cursor: 'pointer',
          'user-select': 'none',
          'font-size': '12px',
          color: colors.text,
        }}
      >
        <button
          type="button"
          aria-label={expanded() ? 'Collapse' : 'Expand'}
          onClick={(event) => {
            event.stopPropagation();
            setExpanded(!expanded());
          }}
          style={{
            width: '14px',
            height: '14px',
            display: 'inline-flex',
            'align-items': 'center',
            'justify-content': 'center',
            background: 'transparent',
            color: colors.textMuted,
            border: 'none',
            cursor: 'pointer',
            'font-size': '10px',
            padding: 0,
            visibility: hasChildren() ? 'visible' : 'hidden',
          }}
        >
          {expanded() ? '▾' : '▸'}
        </button>
        <span style={{ flex: '1 1 auto', overflow: 'hidden', 'text-overflow': 'ellipsis', 'white-space': 'nowrap' }}>
          {name()}
        </span>
        <span
          onClick={(event) => {
            event.stopPropagation();
            services.commands.removeEntity(props.entity.id.value);
          }}
          style={{
            color: colors.textMuted,
            'font-size': '14px',
            padding: '0 4px',
            cursor: 'pointer',
            'line-height': 1,
          }}
          role="button"
          aria-label="Delete entity"
          title="Delete entity"
        >
          ×
        </span>
      </div>
      <Show when={expanded() && hasChildren()}>
        <For each={childEntities()}>
          {(child) => <HierarchyNode entity={child} depth={props.depth + 1} />}
        </For>
      </Show>
    </div>
  );
}

/** Toolbar above the tree. Kept here so the hierarchy panel is self-contained. */
export function HierarchyToolbar(): JSX.Element {
  const services = useEditorServices();
  return (
    <div
      style={{
        display: 'flex',
        gap: `${spacing.xs}px`,
        padding: `${spacing.xs}px ${spacing.sm}px`,
        'border-bottom': `1px solid ${colors.border}`,
        background: colors.surfaceAlt,
      }}
    >
      <Button
        size="sm"
        variant="primary"
        onClick={() => {
          const firstRoot = services.scene.rootEntities[0];
          const color = Math.floor(Math.random() * 0xffffff);
          const entity = createCubeEntity(services, color);
          services.commands.addEntity(firstRoot?.id.value ?? null, entity);
        }}
      >
        + Cube
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => {
          const entity = createEmptyEntity(services);
          services.commands.addEntity(services.scene.rootEntities[0]?.id.value ?? null, entity);
        }}
      >
        + Group
      </Button>
    </div>
  );
}

let __entityCounter = 0;
function nextEntityId(prefix: string, name: string): string {
  __entityCounter = (__entityCounter + 1) | 0;
  return `${prefix}_${name.replace(/[^A-Za-z0-9]/g, '_')}_${__entityCounter.toString(36)}`;
}

function createCubeEntity(_services: ReturnType<typeof useEditorServices>, color: number): EntityType {
  const id = Uid.from(nextEntityId('cube', 'Cube'));
  const entity = Entity.create('Cube', id);
  entity.addComponent(createCubeMesh(color));
  const t = entity.getComponent('transform');
  if (t) {
    const offset = (__entityCounter * 0.37) % 3 - 1.5;
    t.position = { x: offset, y: 0.5, z: offset };
  }
  return entity;
}

function createEmptyEntity(_services: ReturnType<typeof useEditorServices>): EntityType {
  const id = Uid.from(nextEntityId('group', 'Group'));
  return Entity.create('Group', id);
}
