import { EventBus, InvariantError } from '@sined/shared';
import type { Command } from './command.js';

export interface HistoryEvents {
  push: { command: Command };
  undo: { command: Command };
  redo: { command: Command };
  truncate: void;
}

/**
 * Bounded undo/redo stack. Capacity defaults to 200; the stack drops the
 * oldest entry when full. The `truncate` event fires when forward history
 * is discarded because a new command was pushed after some undos.
 */
export class HistoryStack {
  readonly events = new EventBus<HistoryEvents>();
  private readonly undoStack: Command[] = [];
  private readonly redoStack: Command[] = [];

  constructor(public readonly capacity = 200) {
    if (capacity <= 0) {
      throw new InvariantError('HistoryStack capacity must be positive.');
    }
  }

  push(command: Command, execute: () => void | Promise<void> = () => command.execute()): Promise<void> {
    if (this.redoStack.length > 0) {
      this.redoStack.length = 0;
      this.events.emit('truncate', undefined);
    }
    // Optional coalescing with the most recent command.
    const last = this.undoStack[this.undoStack.length - 1];
    if (last && command.coalesceWith) {
      const merged = command.coalesceWith(last);
      if (merged) {
        this.undoStack[this.undoStack.length - 1] = merged;
        return Promise.resolve(execute()).then(() => {
          this.events.emit('push', { command: merged });
        });
      }
    }
    this.undoStack.push(command);
    while (this.undoStack.length > this.capacity) {
      this.undoStack.shift();
    }
    return Promise.resolve(execute()).then(() => {
      this.events.emit('push', { command });
    });
  }

  async undo(): Promise<boolean> {
    const cmd = this.undoStack.pop();
    if (!cmd) return false;
    await cmd.undo();
    this.redoStack.push(cmd);
    this.events.emit('undo', { command: cmd });
    return true;
  }

  async redo(): Promise<boolean> {
    const cmd = this.redoStack.pop();
    if (!cmd) return false;
    await cmd.execute();
    this.undoStack.push(cmd);
    this.events.emit('redo', { command: cmd });
    return true;
  }

  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  clear(): void {
    this.undoStack.length = 0;
    this.redoStack.length = 0;
  }
}
