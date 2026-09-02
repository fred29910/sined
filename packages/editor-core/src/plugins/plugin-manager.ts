import type { EditorPlugin } from './plugin.js';
import type { PluginContext } from '../registries/registries.js';

interface ActiveRecord {
  plugin: EditorPlugin;
}

/**
 * Manages the lifecycle of editor plugins. Activation is awaited so a plugin
 * that needs to register async importers (Phase 4) can still participate in
 * the editor's startup sequence.
 */
export class PluginManager {
  private readonly plugins = new Map<string, ActiveRecord>();

  constructor(private readonly ctx: PluginContext) {}

  register(plugin: EditorPlugin): void {
    if (this.plugins.has(plugin.id)) {
      throw new Error(`Plugin already registered: ${plugin.id}`);
    }
    this.plugins.set(plugin.id, { plugin });
  }

  async activate(id: string): Promise<void> {
    const rec = this.plugins.get(id);
    if (!rec) throw new Error(`Unknown plugin: ${id}`);
    await rec.plugin.activate(this.ctx);
  }

  async activateAll(): Promise<void> {
    for (const id of this.plugins.keys()) {
      await this.activate(id);
    }
  }

  async deactivate(id: string): Promise<void> {
    const rec = this.plugins.get(id);
    if (!rec) return;
    await rec.plugin.deactivate();
  }

  async deactivateAll(): Promise<void> {
    for (const id of this.plugins.keys()) {
      await this.deactivate(id);
    }
  }

  list(): ReadonlyArray<EditorPlugin> {
    return Array.from(this.plugins.values()).map((r) => r.plugin);
  }
}
