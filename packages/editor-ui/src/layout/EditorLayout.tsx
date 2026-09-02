import { createSignal, type JSX } from 'solid-js';
import { Button, Splitter, colors, spacing } from '@sined/ui';
import { AssetBrowser, Hierarchy, Inspector, Viewport } from '../features/features-index.js';
import { useEditorServices } from '../app/editor-services.js';

const MIN_SIDE = 180;
const MIN_BOTTOM = 120;

/**
 * Top-level editor chrome. Five regions:
 *   ┌─ top bar ────────────────────────────────────────┐
 *   │  file · edit · view · plugins                   │
 *   ├─ left ──┬─ viewport ──────────────┬─ inspector ──┤
 *   │  tree   │                         │              │
 *   │  assets │                         │              │
 *   └─────────┴─────────────────────────┴──────────────┘
 *
 * Phase 0 wires static proportions; the `Splitter` callbacks update Solid
 * signals so the layout reflows as the user drags.
 */
export function EditorLayout(): JSX.Element {
  const services = useEditorServices();

  const [leftRatio, setLeftRatio] = createSignal(0.2);
  const [rightRatio, setRightRatio] = createSignal(0.22);
  const [bottomRatio, setBottomRatio] = createSignal(0.22);

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
      <TopBar sceneName={services.scene.name} />

      <div style={{ display: 'flex', flex: '1 1 auto', 'min-height': 0 }}>
        <div
          style={{
            width: `${leftRatio() * 100}%`,
            'min-width': `${MIN_SIDE}px`,
            display: 'flex',
            'flex-direction': 'column',
            background: colors.surface,
            'border-right': `1px solid ${colors.border}`,
          }}
        >
          <div style={{ flex: '1 1 60%', 'min-height': 0, 'border-bottom': `1px solid ${colors.border}` }}>
            <Hierarchy />
          </div>
          <div style={{ flex: `0 0 ${bottomRatio() * 100}%`, 'min-height': `${MIN_BOTTOM}px` }}>
            <AssetBrowser />
          </div>
        </div>

        <Splitter orientation="vertical" initialRatio={leftRatio()} onChange={setLeftRatio} />

        <div style={{ flex: '1 1 auto', display: 'flex', 'min-width': 0 }}>
          <Viewport />
        </div>

        <Splitter orientation="vertical" initialRatio={rightRatio()} onChange={setRightRatio} />

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

      <StatusBar bottomRatio={bottomRatio()} onBottomChange={setBottomRatio} />
    </div>
  );
}

function TopBar(props: { sceneName: string }): JSX.Element {
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
      <Button size="sm" variant="ghost">
        File
      </Button>
      <Button size="sm" variant="ghost">
        Edit
      </Button>
      <Button size="sm" variant="ghost">
        View
      </Button>
      <Button size="sm" variant="primary">
        Play
      </Button>
    </div>
  );
}

function StatusBar(props: { bottomRatio: number; onBottomChange: (r: number) => void }): JSX.Element {
  // The status bar in Phase 0 simply renders the bottom-asset-pane ratio;
  // Phase 1+ will surface the actual engine state (FPS, selected count,
  // history pointer) here.
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
      }}
    >
      <span>Phase 0 skeleton</span>
      <span>·</span>
      <span>Bottom pane ratio: {(props.bottomRatio * 100).toFixed(0)}%</span>
      <div style={{ flex: '1 1 auto' }} />
      <button
        type="button"
        onClick={() => props.onBottomChange(0.3)}
        style={{
          background: 'transparent',
          color: colors.textMuted,
          border: 'none',
          cursor: 'pointer',
          'font-size': '11px',
        }}
      >
        Reset bottom pane
      </button>
    </div>
  );
}
