# @SINED/EDITOR-CORE — COMMAND BUS, UNDO, SELECTION, PLUGIN

**Generated:** 2026-09-02  **Branch:** main  **Scope:** commands, undo/redo, selection, plugin (353-line hotspot)

## OVERVIEW

CommandBus, Undo/Redo, Selection, Plugin engine. Largest source file in workspace: `commands/scene-commands.ts` (353 lines). Source-only; consumed via Vite / `tsc`.

## STRUCTURE

```
packages/editor-core/src/
├── index.ts                     # Package export
├── commands/                    # Hotspot
│   ├── scene-commands.ts        # 353 lignes — définitions de commandes
│   ├── command.ts               # Types de commandes
│   ├── command-bus.ts           # Bus de commandes
│   └── history-stack.ts         # Pile d'historique (Undo/Redo)
└── ...                          # Undo, selection, plugin internals
```

## WHERE TO LOOK

| Task | Location | Notes |
|---|---|---|
| Add new command | `commands/` | Mirror `scene-commands.ts` pattern; 353-line file is reference |
| Undo / redo | `commands/history-stack.ts` | Stack-based; verify with `scripts/smoke.mjs` |
| Selection | source root | Tied to editor-core; not in engine |
| Plugin | source root | Plugin engine lives here |

## CONVENTIONS (distinct from parent)

- Commands defined as classes/functions in `commands/` with matching `.d.ts` types.
- `scene-commands.ts` is the authoritative reference for command structure.
- Source-only — build step is `echo 'source-only'`; no compiled output.

## ANTI-PATTERNS (THIS PACKAGE)

- Do not import `three` or engine render types here directly unless through `@sined/engine`; dependency direction is `editor-core → engine`.
- Do not modify `scene-commands.ts` without running `scripts/smoke.mjs` (no test suite exists).
- No `as any` suppressions — none found; keep clean.

## NOTES

- Zero test files — validate by smoke script (`scripts/smoke.mjs`) and manual check after any command change.
- The 353-line `scene-commands.ts` is the only file >300 lines in the entire workspace.
- Dependency: imports `@sined/engine`, `@sined/shared`; used by `editor-ui` and `editor`.
