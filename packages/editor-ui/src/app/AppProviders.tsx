import type { JSX } from 'solid-js';
import {
  AssetImporterRegistry,
  CommandBus,
  CommandRegistry,
  EditorEventBus,
  InspectorRegistry,
  PanelRegistry,
  PluginManager,
  SelectionManager,
  type PluginContext,
} from '@sined/editor-core';
import {
  AddEntityCommand,
  RemoveEntityCommand,
  ReparentEntityCommand,
  SetNameCommand,
  SetTransformCommand,
} from '@sined/editor-core';
import { Engine } from '@sined/engine';
import { createSampleScene, type Entity } from '@sined/domain';
import { EditorServicesProvider, type CommandFactory, type EditorServices } from './editor-services.js';

/**
 * Wires up the singletons that every editor panel needs and exposes them
 * through a Solid context. The composition root intentionally lives in
 * `editor-ui` (not `apps/editor`) so future apps — a headless server, a
 * Web-Worker preview, an automated test harness — can reuse the same setup
 * with a different transport.
 */
export function AppProviders(props: { children: JSX.Element }): JSX.Element {
  const eventBus = new EditorEventBus();
  const commands = new CommandRegistry();
  const panels = new PanelRegistry();
  const inspectors = new InspectorRegistry();
  const importers = new AssetImporterRegistry();

  const commandBus = new CommandBus(undefined, eventBus);
  const selection = new SelectionManager();
  const scene = createSampleScene();
  const engine = new Engine({ withRenderLoop: true });

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

  // Fan-out selection events into the app-wide event bus so the status
  // bar / inspector can subscribe in a single place.
  selection.events.on('changed', ({ selected }) => {
    eventBus.emit('selection:changed', { selected });
  });

  const commandFactory: CommandFactory = {
    addEntity(parentId, entity: Entity) {
      void commandBus.execute(
        new AddEntityCommand({ scene, parentId, entity }),
      );
    },
    removeEntity(entityId) {
      // Resolve the entity up front so the Command can hold a reference
      // for the undo path (the scene graph loses track of detached
      // entities on `removeChild`).
      const target = scene.getEntity(entityId);
      if (!target) return;
      void commandBus.execute(new RemoveEntityCommand({ scene, entity: target }));
    },
    setName(entityId, newName) {
      void commandBus.execute(new SetNameCommand({ scene, entityId, newName }));
    },
    setTransform(entityId, field, value) {
      void commandBus.execute(
        new SetTransformCommand({ scene, entityId, field, value }),
      );
    },
    reparent(entityId, newParentId) {
      void commandBus.execute(
        new ReparentEntityCommand({ scene, entityId, newParentId }),
      );
    },
  };

  const services: EditorServices = {
    scene,
    engine,
    commandBus,
    selection,
    plugins: pluginCtx,
    eventBus,
    commands: commandFactory,
  };

  return <EditorServicesProvider services={services}>{props.children}</EditorServicesProvider>;
}
