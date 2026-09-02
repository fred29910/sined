# @SINED/EDITOR-UI — EDITOR CHROME (FEATURE-FIRST, DEPTH 4)

**Generated:** 2026-09-02  **Branch:** main  **Scope:** chrome features (depth-4 feature dirs, 16-score distinct domain)

## OVERVIEW

Editor chrome: Hierarchy, Viewport, Inspector, Asset Browser. Feature-first at depth 4 (`features/inspector/components/`, `features/inspector/state/`, etc.). Source-only; imports `editor-core`, `ui`, `shared`.

## STRUCTURE

```
packages/editor-ui/src/
├── index.ts                     # Package export
├── features/                    # Feature-first split
│   ├── hierarchy/               # Hierarchy panel
│   ├── inspector/               # Inspector panel (internal depth 4)
│   │   ├── components/          # Inspector.tsx, TransformPanel.tsx
│   │   ├── state/               # inspector.store.ts
│   │   ├── adapters/            # gizmo-bridge.ts
│   │   └── commands/            # update-transform.ts
│   ├── viewport/                # Viewport panel
│   └── asset-browser/           # Asset browser
└── ...
```

## WHERE TO LOOK

| Task | Location | Notes |
|---|---|---|
| Inspector panel / property editing | `features/inspector/` | Depth-4 split by domain (components/state/adapters/commands) |
| Hierarchy tree | `features/hierarchy/` | Component + state inside |
| Viewport / camera | `features/viewport/` | 3D view assembly |
| Asset browser | `features/asset-browser/` | Asset listing / selection |

## CONVENTIONS (distinct from parent)

- Feature dirs sit under `features/`, not by tech type (`components/` vs `stores/`).
- Inside a feature, split by domain (`components/`, `state/`, `adapters/`, `commands/`) — this is the depth-4 convention.
- Never import `engine` directly unless through `editor-core`; dependency order enforced.

## ANTI-PATTERNS (THIS PACKAGE)

- Do not create top-level `components/` or `stores/` at package root — feature-first required.
- Do not import `three` directly here; render controls belong in `engine`.
- No `as any`; maintain clean Solid + TS.

## NOTES

- Phase 0: chrome skeleton (placeholders) only; features fill in subsequently.
- `docs/sturct.md` (typo filename) defines this feature-first architecture extensively.
- Source-only package; no `dist`.
