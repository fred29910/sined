// Barrel for the logging surface. Kept separate from `./logger.ts` so we can
// add additional logging-related helpers (e.g. a `child()` factory, a
// `methodFactory` for prefix-style plugins) without forcing every importer to
// pull them in.
export * from './logger.js';
