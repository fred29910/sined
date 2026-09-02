import { EventBus } from '@sined/shared';
import type { Command } from './command.js';
import { HistoryStack } from './history-stack.js';
import type { EditorEventBus } from '../events/editor-events.js';

export interface CommandBusEvents {
  executed: { command: Command };
  failed: { command: Command; error: unknown };
}

/**
 * Central entry point for all user-intent mutations. The bus runs each
 * command through the `HistoryStack` and broadcasts an `executed` event so
 * the UI can sync to the new state without the engine knowing about it.
 */
export class CommandBus {
  readonly events = new EventBus<CommandBusEvents>();
  constructor(
    public readonly history: HistoryStack = new HistoryStack(),
    private readonly editorEvents?: EditorEventBus,
  ) {}

  execute(command: Command): Promise<void> {
    return this.history.push(command).then(
      () => {
        this.events.emit('executed', { command });
        this.editorEvents?.emit('history:changed', {
          canUndo: this.history.canUndo(),
          canRedo: this.history.canRedo(),
          last: command,
        });
        this.editorEvents?.emit('scene:broadcast', { source: 'command' });
      },
      (error: unknown) => {
        this.events.emit('failed', { command, error });
        throw error;
      },
    );
  }

  undo(): Promise<boolean> {
    return this.history.undo().then((ok) => {
      if (ok) {
        this.editorEvents?.emit('history:changed', {
          canUndo: this.history.canUndo(),
          canRedo: this.history.canRedo(),
          last: null,
        });
        this.editorEvents?.emit('scene:broadcast', { source: 'undo' });
      }
      return ok;
    });
  }

  redo(): Promise<boolean> {
    return this.history.redo().then((ok) => {
      if (ok) {
        this.editorEvents?.emit('history:changed', {
          canUndo: this.history.canUndo(),
          canRedo: this.history.canRedo(),
          last: null,
        });
        this.editorEvents?.emit('scene:broadcast', { source: 'redo' });
      }
      return ok;
    });
  }
}
