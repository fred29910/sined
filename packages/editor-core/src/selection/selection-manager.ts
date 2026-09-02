import { Uid } from '@sined/domain';
import type { Uid as UidType } from '@sined/domain';
import { EventBus } from '@sined/shared';

export interface SelectionEvents {
  changed: { selected: ReadonlyArray<string> };
}

export class SelectionManager {
  readonly events = new EventBus<SelectionEvents>();
  private readonly selected: Set<string> = new Set();

  isSelected(id: UidType | string): boolean {
    const key = id instanceof Uid ? id.value : id;
    return this.selected.has(key);
  }

  list(): ReadonlyArray<string> {
    return Array.from(this.selected);
  }

  select(id: UidType | string, mode: 'replace' | 'toggle' | 'add' = 'replace'): void {
    const key = id instanceof Uid ? id.value : id;
    if (mode === 'replace') {
      this.selected.clear();
      this.selected.add(key);
    } else if (mode === 'toggle') {
      if (this.selected.has(key)) this.selected.delete(key);
      else this.selected.add(key);
    } else if (mode === 'add') {
      this.selected.add(key);
    }
    this.emitChanged();
  }

  clear(): void {
    if (this.selected.size === 0) return;
    this.selected.clear();
    this.emitChanged();
  }

  private emitChanged(): void {
    this.events.emit('changed', { selected: this.list() });
  }
}
