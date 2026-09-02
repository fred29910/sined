/**
 * User-intent record. Every mutating action against the editor goes through
 * a `Command` so that the `HistoryStack` can replay or invert it.
 */
export interface Command {
  readonly id: string;
  readonly label: string;
  execute(): void | Promise<void>;
  undo(): void | Promise<void>;
  /**
   * Optional coalescing key. Two consecutive commands with the same
   * coalesceKey can be merged (used for continuous drags).
   */
  coalesceWith?(other: Command): Command | null;
}
