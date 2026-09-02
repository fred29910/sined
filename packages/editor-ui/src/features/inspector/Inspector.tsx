import { createMemo, createSignal, For, onCleanup, Show, type JSX } from 'solid-js';
import { colors, spacing } from '@sined/ui';
import { useEditorServices } from '../../app/editor-services.js';
import { NumberInput, TextInput } from '../../components/inputs.js';
import type { Entity } from '@sined/domain';

const FIELDS = ['x', 'y', 'z'] as const;
type Axis = typeof FIELDS[number];

/**
 * Inspector for the currently-selected entity. Subscribes to
 * `selection:changed` to swap targets and to `scene:broadcast` to refresh
 * after a Command mutates the displayed values.
 */
export function Inspector(): JSX.Element {
  const services = useEditorServices();
  const [selectedId, setSelectedId] = createSignal<string | null>(null);
  const [version, setVersion] = createSignal(0);

  const detachSelection = services.eventBus.on('selection:changed', ({ selected }) => {
    const first = selected[0] ?? null;
    setSelectedId(first);
    setVersion(0); // selection already implies "look at fresh values"
  });
  const detachScene = services.eventBus.on('scene:broadcast', () => {
    setVersion((v) => v + 1);
  });
  onCleanup(() => {
    detachSelection();
    detachScene();
  });

  const selected = createMemo<Entity | null>(() => {
    // Read `version` to track scene changes for the current selection.
    version();
    const id = selectedId();
    if (!id) return null;
    return services.scene.getEntity(id) ?? null;
  });

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
        overflow: 'auto',
      }}
    >
      <Show
        when={selected()}
        fallback={
          <div style={{ color: colors.textMuted, 'font-style': 'italic' }}>
            No selection — pick an entity from the Hierarchy.
          </div>
        }
      >
        {(entityAccessor) => <InspectorBody entity={entityAccessor()} />}
      </Show>
    </div>
  );
}

function InspectorBody(props: { entity: Entity }): JSX.Element {
  const services = useEditorServices();
  const name = (): string => props.entity.getComponent('name')?.name ?? '';
  const transform = () => props.entity.getComponent('transform');
  const mesh = () => props.entity.getComponent('mesh');

  return (
    <div style={{ display: 'flex', 'flex-direction': 'column', gap: `${spacing.md}px` }}>
      <SectionLabel>Identity</SectionLabel>
      <Field label="Name">
        <TextInput
          ariaLabel="Entity name"
          value={name()}
          onCommit={(next) => services.commands.setName(props.entity.id.value, next)}
        />
      </Field>
      <Show when={mesh()}>
        <Field label="Mesh kind">
          <ReadOnlyValue value={mesh()!.meshKind} />
        </Field>
        <Field label="Color (hex)">
          <ReadOnlyValue value={`#${mesh()!.color.toString(16).padStart(6, '0').toUpperCase()}`} />
        </Field>
      </Show>

      <SectionLabel>Transform</SectionLabel>
      <Show when={transform()} fallback={<div style={{ color: colors.textMuted }}>No transform component.</div>}>
        <VectorField
          label="Position"
          axis="position"
          get={() => transform()!.position}
          onCommit={(axis, value) => {
            const t = transform()!;
            const next = { x: t.position.x, y: t.position.y, z: t.position.z };
            next[axis] = value;
            services.commands.setTransform(props.entity.id.value, 'position', next);
          }}
        />
        <VectorField
          label="Rotation (quat)"
          axis="rotation"
          get={() => transform()!.rotation}
          onCommit={(axis, value) => {
            const t = transform()!;
            const next = { x: t.rotation.x, y: t.rotation.y, z: t.rotation.z, w: t.rotation.w };
            next[axis] = value;
            services.commands.setTransform(props.entity.id.value, 'rotation', next);
          }}
          step={0.05}
        />
        <VectorField
          label="Scale"
          axis="scale"
          get={() => transform()!.scale}
          onCommit={(axis, value) => {
            const t = transform()!;
            const next = { x: t.scale.x, y: t.scale.y, z: t.scale.z };
            next[axis] = value;
            services.commands.setTransform(props.entity.id.value, 'scale', next);
          }}
        />
      </Show>
    </div>
  );
}

function VectorField(props: {
  label: string;
  axis: 'position' | 'rotation' | 'scale';
  get: () => { x: number; y: number; z: number; w?: number };
  onCommit: (axis: Axis, value: number) => void;
  step?: number;
}): JSX.Element {
  const value = (): { x: number; y: number; z: number; w?: number } => props.get();
  return (
    <div>
      <div
        style={{
          'font-size': '10px',
          color: colors.textMuted,
          'margin-bottom': `${spacing.xs}px`,
          'text-transform': 'uppercase',
          'letter-spacing': '0.05em',
        }}
      >
        {props.label}
      </div>
      <div style={{ display: 'flex', gap: `${spacing.xs}px` }}>
        <For each={FIELDS}>
          {(axis) => (
            <NumberInput
              ariaLabel={`${props.label} ${axis.toUpperCase()}`}
              value={value()[axis]}
              step={props.step ?? 0.1}
              onCommit={(next) => props.onCommit(axis, next)}
            />
          )}
        </For>
      </div>
    </div>
  );
}

function Field(props: { label: string; children: JSX.Element }): JSX.Element {
  return (
    <label style={{ display: 'flex', 'flex-direction': 'column', gap: `${spacing.xs}px` }}>
      <span
        style={{
          'font-size': '10px',
          color: colors.textMuted,
          'text-transform': 'uppercase',
          'letter-spacing': '0.05em',
        }}
      >
        {props.label}
      </span>
      {props.children}
    </label>
  );
}

function SectionLabel(props: { children: JSX.Element }): JSX.Element {
  return (
    <div
      style={{
        'font-size': '10px',
        color: colors.textMuted,
        'text-transform': 'uppercase',
        'letter-spacing': '0.08em',
        'border-bottom': `1px solid ${colors.border}`,
        'padding-bottom': `${spacing.xs}px`,
      }}
    >
      {props.children}
    </div>
  );
}

function ReadOnlyValue(props: { value: string }): JSX.Element {
  return (
    <span
      style={{
        color: colors.text,
        'font-family': 'ui-monospace, SFMono-Regular, Menlo, monospace',
        'font-size': '11px',
      }}
    >
      {props.value}
    </span>
  );
}
