export class InvariantError extends Error {
  constructor(message: string) {
    super(`Invariant violation: ${message}`);
    this.name = 'InvariantError';
  }
}

/**
 * Throws an `InvariantError` when `condition` is falsy. Use at module / domain
 * boundaries where a violated precondition indicates a programming bug.
 */
export function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new InvariantError(message);
  }
}

export function never(value: never, message = 'Unhandled discriminant'): never {
  throw new InvariantError(`${message}: ${JSON.stringify(value)}`);
}
