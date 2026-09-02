import type { Command } from '../commands/command.js';
import type { CommandBus } from '../commands/command-bus.js';
import type { EventBus, EventMap } from '@sined/shared';

export interface PanelDescriptor {
  id: string;
  title: string;
  mount(target: HTMLElement): void;
  unmount(target: HTMLElement): void;
}

export interface InspectorDescriptor {
  id: string;
  matches(entity: unknown): boolean;
  render(target: HTMLElement, entity: unknown): void;
}

export interface AssetImporterDescriptor {
  id: string;
  extensions: ReadonlyArray<string>;
  import(file: File): Promise<unknown>;
}

/**
 * Tiny keyed registries. They are plain `Map`s wrapped in a typed facade so
 * tests can introspect the contents and plugins can register at activation.
 */
export class CommandRegistry {
  private readonly map = new Map<string, Command>();
  register(id: string, factory: () => Command): void {
    this.map.set(id, factory());
  }
  create(id: string): Command | undefined {
    return this.map.get(id);
  }
  list(): ReadonlyArray<string> {
    return Array.from(this.map.keys());
  }
}

export class PanelRegistry {
  private readonly map = new Map<string, PanelDescriptor>();
  register(desc: PanelDescriptor): void {
    this.map.set(desc.id, desc);
  }
  get(id: string): PanelDescriptor | undefined {
    return this.map.get(id);
  }
  list(): ReadonlyArray<PanelDescriptor> {
    return Array.from(this.map.values());
  }
}

export class InspectorRegistry {
  private readonly map = new Map<string, InspectorDescriptor>();
  register(desc: InspectorDescriptor): void {
    this.map.set(desc.id, desc);
  }
  for(entity: unknown): ReadonlyArray<InspectorDescriptor> {
    return Array.from(this.map.values()).filter((d) => d.matches(entity));
  }
}

export class AssetImporterRegistry {
  private readonly map = new Map<string, AssetImporterDescriptor>();
  register(desc: AssetImporterDescriptor): void {
    this.map.set(desc.id, desc);
  }
  forExtension(ext: string): AssetImporterDescriptor | undefined {
    const normalized = ext.toLowerCase().replace(/^\./, '');
    return Array.from(this.map.values()).find((d) =>
      d.extensions.map((e) => e.toLowerCase().replace(/^\./, '')).includes(normalized),
    );
  }
  list(): ReadonlyArray<AssetImporterDescriptor> {
    return Array.from(this.map.values());
  }
}

/**
 * The bag of services a plugin receives at activation. We type `eventBus` as
 * a generic `EventBus` so plugins built for an unknown event map still type-
 * check; concrete maps are supplied by the application at construction time.
 */
export interface PluginContext<E extends EventMap = EventMap> {
  readonly commands: CommandRegistry;
  readonly panels: PanelRegistry;
  readonly inspectors: InspectorRegistry;
  readonly importers: AssetImporterRegistry;
  readonly commandBus: CommandBus;
  readonly eventBus: EventBus<E>;
}
