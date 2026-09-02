import { EventBus } from '@sined/shared';
import type { Command } from '../commands/command.js';

export interface EditorEvents {
  /**
   * Emitted after a `Command` is executed and pushed onto the history
   * stack. Subscribers (status bar, undo/redo buttons) read this to
   * refresh their "can undo/redo" state.
   */
  'history:changed': { canUndo: boolean; canRedo: boolean; last: Command | null };
  /**
   * Emitted when the active selection set changes. The payload is the
   * list of selected entity Uids (as strings) so consumers don't need to
   * import the Domain type.
   */
  'selection:changed': { selected: ReadonlyArray<string> };
  /**
   * High-level notification of a scene mutation. Mirrors the Domain's own
   * event stream but is owned by `editor-core` so UI code never imports
   * `@sined/domain` internals.
   */
  'scene:broadcast': { source: 'command' | 'undo' | 'redo' | 'external' };
}

export class EditorEventBus extends EventBus<EditorEvents> {}
