import type { PluginContext } from '../registries/registries.js';

export interface EditorPlugin {
  readonly id: string;
  readonly name: string;
  activate(ctx: PluginContext): void | Promise<void>;
  deactivate(): void | Promise<void>;
}
