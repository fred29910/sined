import { createId } from '@sined/shared';

/**
 * Strongly-typed Entity identifier. Prevents accidental mixing of `Uid` with
 * arbitrary strings across the codebase.
 */
export class Uid {
  readonly value: string;
  private constructor(value: string) {
    this.value = value;
  }
  static generate(prefix = 'ent'): Uid {
    return new Uid(createId(prefix));
  }
  static from(value: string): Uid {
    return new Uid(value);
  }
  toString(): string {
    return this.value;
  }
  equals(other: Uid): boolean {
    return this.value === other.value;
  }
}
