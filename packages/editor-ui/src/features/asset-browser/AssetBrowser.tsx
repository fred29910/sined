import { createSignal, type JSX } from 'solid-js';
import {
  colors,
  fontSize,
  spacing,
  Tabs,
  TabsList,
  TabsPanel,
  TabsTab,
} from '@sined/ui';

const ASSET_TABS = ['models', 'textures', 'audio'] as const;
type AssetTab = typeof ASSET_TABS[number];

/**
 * Asset browser. The Tabs widget is wired up so the panel can demonstrate
 * the `@sined/ui` Tabs keyboard interactions. Each tab body is a placeholder
 * until Phase 5 fills the real assets pipeline.
 */
export function AssetBrowser(): JSX.Element {
  const [active, setActive] = createSignal<AssetTab>('models');

  return (
    <div
      data-panel="asset-browser"
      style={{
        width: '100%',
        height: '100%',
        background: colors.surface,
        color: colors.text,
        'font-size': fontSize.md,
        'box-sizing': 'border-box',
        display: 'flex',
        'flex-direction': 'column',
        'min-height': 0,
      }}
    >
      <Tabs value={active()} onChange={(next) => setActive(next as AssetTab)} idPrefix="asset-browser">
        <TabsList ariaLabel="Asset categories">
          <TabsTab value="models">Models</TabsTab>
          <TabsTab value="textures">Textures</TabsTab>
          <TabsTab value="audio">Audio</TabsTab>
        </TabsList>
        <TabsPanel value="models">
          <AssetList kind="models" />
        </TabsPanel>
        <TabsPanel value="textures">
          <AssetList kind="textures" />
        </TabsPanel>
        <TabsPanel value="audio">
          <AssetList kind="audio" />
        </TabsPanel>
      </Tabs>
    </div>
  );
}

function AssetList(props: { kind: AssetTab }): JSX.Element {
  return (
    <div
      style={{
        padding: `${spacing.sm}px`,
        color: colors.textMuted,
        'font-style': 'italic',
      }}
    >
      {labelFor(props.kind)} land in Phase 5.
    </div>
  );
}

function labelFor(kind: AssetTab): string {
  switch (kind) {
    case 'models': return 'Model assets';
    case 'textures': return 'Texture assets';
    case 'audio': return 'Audio assets';
  }
}
