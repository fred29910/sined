import { createContext, useContext } from 'solid-js';
import type { JSX } from 'solid-js';
import type { CommandBus, PluginContext, SelectionManager } from '@sined/editor-core';
import type { Engine } from '@sined/engine';
import type { Scene } from '@sined/domain';

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
