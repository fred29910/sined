// Thin wrapper over the `loglevel` package. Every package in the monorepo
// obtains a *named* logger through `getLogger('@sined/<package>/<module>')` so
// that developers can enable / disable logging for a specific module from the
// browser console (e.g. `log.getLogger('@sined/engine').setLevel('debug')`)
// without recompiling.
//
// `loglevel` is the smallest viable option (≈1.4 KB gzipped, zero deps) and
// deliberately keeps the original call site visible in stack traces — useful
// when diagnosing listener / renderer errors in the engine hot path.
//
// Why a wrapper instead of importing `loglevel` directly?
// 1. Single import surface (`@sined/shared`) that respects the monorepo's
//    unidirectional dependency rule (Domain / Engine stay framework-free but
//    can still log through `shared`).
// 2. Stable surface if we ever swap the underlying implementation or layer a
//    plugin (e.g. `loglevel-plugin-prefix` for colour-coded output) — call
//    sites only know about `Logger`, `LogLevel`, and these two functions.

import loglevel from 'loglevel';

// Re-export the public type surface from `loglevel` so consumers can talk
// about `LogLevelDesc` / `Logger` without taking a direct dependency on the
// underlying package. The union of these types is what `getLogger` and
// `setDefaultLogLevel` accept / return.
export type { LogLevelDesc as LogLevel, Logger, LoggingMethod, MethodFactory, RootLogger } from 'loglevel';

/**
 * Obtain a named logger. Each package should request a logger with a stable
 * name (e.g. `'@sined/engine'`, `'@sined/domain/scene'`) so individual
 * modules can be toggled at runtime without affecting siblings.
 */
export function getLogger(name: string): loglevel.Logger {
  return loglevel.getLogger(name);
}

/**
 * Set the *default* log level for every logger that has not been configured
 * individually. Unlike `logger.setLevel(...)`, the default is **not**
 * persisted to `localStorage`, so the next page load resets to the value
 * chosen by the application entry point (typically `'info'` in dev, `'warn'`
 * in production). Intended to be called exactly once during bootstrap.
 */
export function setDefaultLogLevel(level: loglevel.LogLevelDesc): void {
  loglevel.setDefaultLevel(level);
}

