# Logging

Tiny layer over the [`loglevel`](https://github.com/pimterry/loglevel) package
(~1.4 KB gzipped, zero dependencies) exposed through `@sined/shared`.

## Why a wrapper?

- One import surface for the whole monorepo. Domain / Engine / Editor Core
  stay framework-independent but can still log through `@sined/shared`.
- Stable façade so the underlying implementation can be swapped (or a plugin
  like `loglevel-plugin-prefix` can be layered in) without touching call
  sites.
- Preserves the original stack frame in DevTools — `loglevel` rebinds the
  console methods directly, so an error logged from `engine.ts:76` still
  shows that exact line, not an internal wrapper.

## Usage

```ts
import { getLogger } from '@sined/shared';

const log = getLogger('@sined/engine');

log.debug('starting tick', { dt });
log.info('renderer attached');
log.warn('asset missing, falling back to default', assetId);
log.error('renderer threw on tick', err);
```

## Naming convention

Use `@sined/<package>` for whole-package loggers, or `@sined/<package>/<module>`
for finer granularity. Stable names are important — they are how developers
target a specific module at runtime:

```ts
// In the browser DevTools console:
log.getLogger('@sined/engine').setLevel('debug');
log.getLogger('@sined/domain/scene').setLevel('trace');
```

## Configuring the default level

The app entry (`apps/editor/src/index.tsx`) calls `setDefaultLogLevel` once
during bootstrap, before any module grabs a logger. The default is
**non-persistent** so a developer's last `setLevel('trace')` override in
DevTools survives page reloads.

```ts
import { setDefaultLogLevel } from '@sined/shared';
setDefaultLogLevel(import.meta.env.DEV ? 'info' : 'warn');
```

## Levels

`loglevel` ships with five levels: `trace`, `debug`, `info`, `warn`, `error`,
plus `silent`. The shipped default in this project is `info` (dev) / `warn`
(prod).
