import { EventBus } from '@sined/shared';
import type { Command } from './command.js';
import { HistoryStack } from './history-stack.js';

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
  constructor(public readonly history: HistoryStack = new HistoryStack()) {}

  execute(command: Command): Promise<void> {
    return this.history.push(command).then(
      () => this.events.emit('executed', { command }),
      (error: unknown) => {
        this.events.emit('failed', { command, error });
        throw error;
      },
    );
  }

  undo(): Promise<boolean> {
    return this.history.undo();
  }

  redo(): Promise<boolean> {
    return this.history.redo();
  }
}
