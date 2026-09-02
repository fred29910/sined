import type { JSX } from 'solid-js';
import { CommandBus, PluginManager, SelectionManager, type PluginContext } from '@sined/editor-core';
import { Engine } from '@sined/engine';
import { Scene } from '@sined/domain';
import { AssetImporterRegistry, CommandRegistry, InspectorRegistry, PanelRegistry } from '@sined/editor-core';
import { EventBus } from '@sined/shared';
import { EditorServicesProvider, type EditorServices } from './editor-services.js';

/**
 * Wires up the singletons that every editor panel needs and exposes them
 * through a Solid context. The composition root intentionally lives in
 * `editor-ui` (not `apps/editor`) so future apps — a headless server, a
 * Web-Worker preview, an automated test harness — can reuse the same setup
 * with a different transport.
 */
export function AppProviders(props: { children: JSX.Element }): JSX.Element {
  const eventBus = new EventBus();
  const commands = new CommandRegistry();
  const panels = new PanelRegistry();
  const inspectors = new InspectorRegistry();
  const importers = new AssetImporterRegistry();

  const commandBus = new CommandBus();
  const selection = new SelectionManager();
  const scene = new Scene('Untitled Scene');
  const engine = new Engine({ withRenderLoop: false });

  const pluginCtx: PluginContext = {
    commands,
    panels,
    inspectors,
    importers,
    commandBus,
    eventBus,
  };

  // Touch the PluginManager so the import isn't shaken out before Phase 5+
  // wires real plugins. We do not activate anything yet.
  void new PluginManager(pluginCtx);

  const services: EditorServices = {
    scene,
    engine,
    commandBus,
    selection,
    plugins: pluginCtx,
  };

  return <EditorServicesProvider services={services}>{props.children}</EditorServicesProvider>;
}
