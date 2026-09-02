# @SINED/ENGINE — THREE.JS RENDER LOOP, ECS, ASSETS

**Generated:** 2026-09-02  **Branch:** main  **Scope:** Three.js render / ECS / assets (3 refs, source-only)

## OVERVIEW

Three.js render loop, ECS, asset pipeline, sync. Source-only (`echo 'source-only'`); no build artifact. Dependency: `engine → domain → shared`.

## STRUCTURE

```
packages/engine/src/
├── index.ts                     # Package export
├── core/                        # Render loop, camera, scene
├── ecs/                         # Entity-component-system
├── render/                      # Render passes, materials
├── assets/                      # Asset pipeline
└── sync/                        # Scene sync
    └── scene-sync.ts            # Design constraint: "never call" at line 21 (not anti-pattern)
```

## WHERE TO LOOK

| Task | Location | Notes |
|---|---|---|
| Render loop / camera | `core/` | Three.js scene management |
| ECS entities / components | `ecs/` | Framework-independent entities from domain |
| Asset pipeline | `assets/` | Load / process / release GPU resources |
| Scene sync | `sync/scene-sync.ts` | Line 21 design constraint noted |

## CONVENTIONS (distinct from parent)

- Source-only — consumed by Vite / `tsc`; never compiled separately.
- `scene-sync.ts:21` contains `"never call"` — design constraint on sync call order, not a forbidden pattern.
- Must not import `solid-js` or `editor-core`; depends only on `domain` and `shared`.

## ANTI-PATTERNS (THIS PACKAGE)

- Do not import framework UI (`solid-js`) — engine is render-only.
- Do not suppress `never` in `scene-sync.ts`; it is intentional design constraint.
- No empty `catch {}` blocks found; maintain.

## NOTES

- Zero tests; verify with `scripts/smoke.mjs` (headless, no Three.js required) + manual check.
- Largest file is only ~300 lines (none exceed `editor-core`'s 353-line hotspot).
- `three` package referenced at 3 refs (low centrality relative to shared/domain).
