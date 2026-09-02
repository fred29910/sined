# @SINED/SHARED — PURE-TS UTILITIES

**Generated:** 2026-09-02  **Branch:** main  **Scope:** cross-cutting utilities (17 refs — highest in workspace)

## OVERVIEW

Pure TypeScript utilities, math, event bus, logging; framework-independent; zero dependencies. Most-referenced package in workspace.

## STRUCTURE

```
packages/shared/src/
├── index.ts                     # Flat re-export boundary (named symbols only)
├── utils/                        # id, result, assert
│   └── index.ts
├── math/                         # vec3, quaternion
├── types/                        # disposable, event-bus
├── constants/                    # engine constants
└── logging/                      # logging/index.ts
```

## WHERE TO LOOK

| Task | Location | Notes |
|---|---|---|
| Math / vector ops | `math/vec3.js`, `math/quaternion.js` | No external math lib |
| Result / error types | `utils/result.js` | `never` type is legitimate — design constraint |
| Event bus | `types/event-bus.ts` | Cross-package event bus |
| Shared constants | `constants/engine.ts` | Engine-wide constants |
| Logging | `logging/index.ts` | Internal mostly; cross-package use limited |

## CONVENTIONS (distinct from parent)

- Flat `index.ts` — no nested namespaces; import named exports only (`import { vec3 } from '@sined/shared'`).
- `utils/result.ts` defines a `Result` type with a `never` branch — not an anti-pattern; do not "fix".
- `math/` is pure functions, no classes or side effects.

## ANTI-PATTERNS (THIS PACKAGE)

- Do not add framework imports (`solid-js`, `three`) — this package must stay framework-independent.
- Do not change `Result.never` to `any`; it is intentional.
- Do not create nested sub-exports (`shared/utils/id`) — flat boundary enforced.

## NOTES

- Source-only (no `dist`); consumed by Vite / `tsc` directly.
- `packages/shared/src/index.ts` is the single public API surface.
- Most imported by `engine` (11), `editor-core` (10), `domain` (4).
