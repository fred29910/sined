import { createContext, useContext } from 'solid-js';
import type { JSX } from 'solid-js';
import type { CommandBus, EditorEventBus, PluginContext, SelectionManager } from '@sined/editor-core';
import type { Engine } from '@sined/engine';
import type { Scene } from '@sined/domain';

/**
 * Convenience factory set exposed to UI panels. Each method returns a
 * freshly-constructed command ready to be passed to `commandBus.execute`.
 * Centralizing the wiring here keeps the UI free of direct scene mutation
 * and ensures every change goes through the history stack.
 */
export interface CommandFactory {
  addEntity(parentId: string | null, entity: import('@sined/domain').Entity): void;
  removeEntity(entityId: string): void;
  setName(entityId: string, newName: string): void;
  setTransform(entityId: string, field: 'position' | 'rotation' | 'scale', value: { x: number; y: number; z: number; w?: number }): void;
  reparent(entityId: string, newParentId: string | null): void;
}

/**
 * The runtime services consumed by editor panels. The shape is intentionally
 * close to `PluginContext` so the same bundle can drive both the plugin
 * system and the React-style context wiring that the UI uses.
 */
export interface EditorServices {
  readonly scene: Scene;
  readonly engine: Engine;
  readonly commandBus: CommandBus;
  readonly selection: SelectionManager;
  readonly plugins: PluginContext;
  readonly eventBus: EditorEventBus;
  readonly commands: CommandFactory;
}

const EditorServicesContext = createContext<EditorServices | undefined>(undefined);

/**
 * React-style wrapper around the context provider so consumers can pass
 * `services` as a regular prop instead of the underlying Solid `value` prop.
 */
export function EditorServicesProvider(props: {
  services: EditorServices;
  children: JSX.Element;
}): JSX.Element {
  return (
    <EditorServicesContext.Provider value={props.services}>
      {props.children}
    </EditorServicesContext.Provider>
  );
}

export function useEditorServices(): EditorServices {
  const services = useContext(EditorServicesContext);
  if (!services) {
    throw new Error('useEditorServices must be used inside an <EditorServicesProvider>.');
  }
  return services;
}

export type EditorServicesProviderProps = {
  services: EditorServices;
  children: JSX.Element;
};
