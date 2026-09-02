import { createSignal, onCleanup, type JSX } from 'solid-js';
import { Button, Splitter, colors, spacing } from '@sined/ui';
import { AssetBrowser, Hierarchy, Inspector, Viewport } from '../features/features-index.js';
import { useEditorServices } from '../app/editor-services.js';

const MIN_SIDE = 180;
const MIN_BOTTOM_PX = 120;
const DEFAULT_BOTTOM_PX = 200;

/**
 * Top-level editor chrome. The four regions wire to feature panels
 * (Hierarchy / Viewport / Inspector / AssetBrowser) and the top bar
 * surfaces the editor-level actions (undo/redo).
 *
 * The two side splitters control panel *ratios* of the horizontal row
 * (leftRatio, rightRatio). The vertical splitter inside the left column
 * controls the *pixel* height of the AssetBrowser; the Hierarchy above
 * it takes the remaining space via `flex: 1 1 auto`.
 */
export function EditorLayout(): JSX.Element {
  const services = useEditorServices();

  const [leftRatio, setLeftRatio] = createSignal(0.2);
  const [rightRatio, setRightRatio] = createSignal(0.22);
  const [bottomPx, setBottomPx] = createSignal(DEFAULT_BOTTOM_PX);
  const [canUndo, setCanUndo] = createSignal(false);
  const [canRedo, setCanRedo] = createSignal(false);
  const [entityCount, setEntityCount] = createSignal(0);

  const detachHistory = services.eventBus.on('history:changed', ({ canUndo, canRedo }) => {
    setCanUndo(canUndo);
    setCanRedo(canRedo);
  });
  const refreshCount = (): void => {
    let n = 0;
    services.scene.walk(() => {
      n += 1;
    });
    setEntityCount(n);
  };
  const detachScene = services.eventBus.on('scene:broadcast', refreshCount);
  onCleanup(() => {
    detachHistory();
    detachScene();
  });
  queueMicrotask(() => {
    setCanUndo(services.commandBus.history.canUndo());
    setCanRedo(services.commandBus.history.canRedo());
    refreshCount();
  });

  // Refs for the pixel-mode splitters. They read the controlled panel's
  // own bounding box, so the math is independent of where the panel sits
  // in the flex layout.
  let assetRef: HTMLDivElement | undefined;
  let leftColumnRef: HTMLDivElement | undefined;

  return (
    <div
      style={{
        display: 'flex',
        'flex-direction': 'column',
        width: '100vw',
        height: '100vh',
        background: colors.bg,
        color: colors.text,
        'font-family': 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <TopBar
        sceneName={services.scene.name}
        canUndo={canUndo()}
        canRedo={canRedo()}
        onUndo={() => {
          void services.commandBus.undo();
        }}
        onRedo={() => {
          void services.commandBus.redo();
        }}
      />

      <div style={{ display: 'flex', flex: '1 1 auto', 'min-height': 0 }}>
        <div
          ref={leftColumnRef}
          style={{
            width: `${leftRatio() * 100}%`,
            'min-width': `${MIN_SIDE}px`,
            display: 'flex',
            'flex-direction': 'column',
            background: colors.surface,
            'border-right': `1px solid ${colors.border}`,
            'min-height': 0,
          }}
        >
          <div
            style={{
              flex: '1 1 auto',
              'min-height': 0,
              'border-bottom': `1px solid ${colors.border}`,
            }}
          >
            <Hierarchy />
          </div>
          <Splitter
            orientation="horizontal"
            align="end"
            targetRef={assetRef ?? null}
            onChangePx={setBottomPx}
          />
          <div
            ref={assetRef}
            style={{
              flex: `0 0 ${Math.max(MIN_BOTTOM_PX, bottomPx())}px`,
              'min-height': `${MIN_BOTTOM_PX}px`,
            }}
          >
            <AssetBrowser />
          </div>
        </div>

        <Splitter
          orientation="vertical"
          initialRatio={leftRatio()}
          onChange={setLeftRatio}
        />

        <div style={{ flex: '1 1 auto', display: 'flex', 'min-width': 0, 'min-height': 0 }}>
          <Viewport />
        </div>

        <Splitter
          orientation="vertical"
          initialRatio={rightRatio()}
          align="end"
          onChange={setRightRatio}
        />

        <div
          style={{
            width: `${rightRatio() * 100}%`,
            'min-width': `${MIN_SIDE}px`,
            background: colors.surface,
            'border-left': `1px solid ${colors.border}`,
          }}
        >
          <Inspector />
        </div>
      </div>

      <StatusBar
        entityCount={entityCount()}
        bottomPx={bottomPx()}
        onResetBottom={() => setBottomPx(DEFAULT_BOTTOM_PX)}
      />
    </div>
  );
}

function TopBar(props: {
  sceneName: string;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}): JSX.Element {
  return (
    <div
      style={{
        display: 'flex',
        'align-items': 'center',
        gap: `${spacing.sm}px`,
        height: '40px',
        padding: `0 ${spacing.md}px`,
        background: colors.surfaceAlt,
        'border-bottom': `1px solid ${colors.border}`,
        'font-size': '12px',
      }}
    >
      <strong style={{ color: colors.text }}>Sined Editor</strong>
      <span style={{ color: colors.textMuted }}>·</span>
      <span style={{ color: colors.textMuted }}>{props.sceneName}</span>
      <div style={{ flex: '1 1 auto' }} />
      <Button
        size="sm"
        variant="ghost"
        onClick={props.onUndo}
        disabled={!props.canUndo}
        title="Undo (Ctrl+Z)"
      >
        Undo
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={props.onRedo}
        disabled={!props.canRedo}
        title="Redo (Ctrl+Shift+Z)"
      >
        Redo
      </Button>
    </div>
  );
}

function StatusBar(props: {
  entityCount: number;
  bottomPx: number;
  onResetBottom: () => void;
}): JSX.Element {
  return (
    <div
      style={{
        display: 'flex',
        'align-items': 'center',
        gap: `${spacing.md}px`,
        height: '24px',
        padding: `0 ${spacing.md}px`,
        background: colors.surfaceAlt,
        'border-top': `1px solid ${colors.border}`,
        'font-size': '11px',
        color: colors.textMuted,
        'font-family': 'ui-monospace, SFMono-Regular, Menlo, monospace',
      }}
    >
      <span>Phase 1 · core architecture online</span>
      <span>·</span>
      <span>Entities: {props.entityCount}</span>
      <span>·</span>
      <span>Asset browser: {Math.round(props.bottomPx)}px</span>
      <div style={{ flex: '1 1 auto' }} />
      <button
        type="button"
        onClick={props.onResetBottom}
        style={{
          background: 'transparent',
          color: colors.textMuted,
          border: 'none',
          cursor: 'pointer',
          'font-size': '11px',
          'font-family': 'inherit',
        }}
      >
        Reset bottom pane
      </button>
    </div>
  );
}
