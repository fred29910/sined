# @SINED/EDITOR-UI — EDITOR CHROME (FEATURE-FIRST, DEPTH 4)

**Generated:** 2026-09-02  **Branch:** main  **Scope:** chrome features (depth-4 feature dirs)

## OVERVIEW

Editor chrome: Hierarchy, Viewport, Inspector, Asset Browser. Feature-first at depth 4 (`features/inspector/components/`, `features/inspector/state/`, etc.). Source-only; imports `editor-core`, `ui`, `shared`.

Phase 2 status:
- `HierarchyNode` collapse/expand glyph and delete button now use the new `IconButton` atomic.
- `Inspector` reads `TextInput` / `NumberInput` from `@sined/ui` (no more local `components/inputs.tsx`).
- `EditorLayout` TopBar / StatusBar use `Button` for Undo / Redo / Reset bottom pane.
- `AssetBrowser` upgraded from a placeholder to a `Tabs`-driven panel (Models / Textures / Audio).
- All atomics are sourced from `@sined/ui`. No inline atomic components remain in this package.

## STRUCTURE

```
packages/editor-ui/src/
├── index.ts                        # Package public surface
├── app/
│   ├── AppProviders.tsx            # Composition root
│   └── editor-services.tsx         # Solid context wiring
├── layout/
│   └── EditorLayout.tsx            # Top-level chrome
└── features/
    ├── hierarchy/                  # Hierarchy panel (tree + toolbar)
    ├── inspector/                  # Inspector panel (depth 4)
    │   ├── components/             # (Phase 3+ — currently inline in Inspector.tsx)
    │   ├── state/                  # (Phase 3+)
    │   ├── adapters/               # (Phase 3+ — gizmo bridge)
    │   └── commands/               # (Phase 3+)
    ├── viewport/                   # Three.js viewport
    └── asset-browser/              # Tabs-driven asset list
```

## WHERE TO LOOK

| Task | Location | Notes |
|---|---|---|
| Inspector panel / property editing | `features/inspector/` | Depth-4 split by domain |
| Hierarchy tree | `features/hierarchy/` | `HierarchyNode.tsx` is recursive |
| Viewport / camera | `features/viewport/` | 3D view assembly |
| Asset browser | `features/asset-browser/` | `Tabs` from `@sined/ui` |
| Top-level layout (top bar / status bar / splitters) | `layout/EditorLayout.tsx` | Undo/Redo use `Button` |
| Service context (Solid) | `app/editor-services.tsx` | `useEditorServices` hook |
| App composition root | `app/AppProviders.tsx` | Wires `CommandBus`, `Engine`, `Scene` |

## CONVENTIONS (distinct from parent)

- **Feature-first** at the package root: `features/<name>/`, never top-level `components/` or `stores/`.
- **Inside a feature**, split by domain (`components/`, `state/`, `adapters/`, `commands/`) — depth-4 convention.
- **No top-level `components/`** in this package (removed in Phase 2 when `inputs.tsx` migrated to `@sined/ui`).
- **Atomic UI lives in `@sined/ui`** — never re-implement Button / Input / Splitter / etc. here.
- **Never import `three` directly**; render controls belong in `engine`.
- **No `as any`**; maintain clean Solid + TS.

## ANTI-PATTERNS (THIS PACKAGE)

- Do not create top-level `components/` or `stores/` at package root — feature-first required.
- Do not import `three` directly here; render controls belong in `engine`.
- Do not import `engine` directly here; route through `editor-core` (or use `useEditorServices`).
- Do not re-implement atomic components (`Button`, `Input`, `Splitter`, etc.); consume them from `@sined/ui`.
- No `as any`; maintain clean Solid + TS.

## PHASE 2 CHANGES (SUMMARY)

- `components/inputs.tsx` removed. `Inspector.tsx` now imports `TextInput` / `NumberInput` from `@sined/ui`.
- `index.ts` no longer re-exports `TextInput` / `NumberInput` (they live in `@sined/ui`).
- `HierarchyNode.tsx`: collapse / expand glyph and delete `×` use the new `IconButton` from `@sined/ui`.
- `EditorLayout.tsx`: StatusBar's "Reset bottom pane" uses `Button`; TopBar's Undo / Redo keep `Button`; the status bar's phase label bumped to "Phase 2 · UI design system online".
- `AssetBrowser.tsx`: rewired to `<Tabs>` from `@sined/ui` (Models / Textures / Audio); each panel still shows a "land in Phase 5" placeholder.

## NOTES

- Phase 2: chrome skeleton fully wired to `@sined/ui` atomics. The Inspector's depth-4 split (`components/`, `state/`, `adapters/`, `commands/`) is still a Phase 3+ refactor — currently the Inspector is a single `Inspector.tsx` file. Splitting it is tracked but not required for Phase 2.
- `docs/sturct.md` (typo filename) defines this feature-first architecture extensively.
- Source-only package; no `dist`.
