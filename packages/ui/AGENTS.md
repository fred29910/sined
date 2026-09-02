# @SINED/UI — SOLID ATOMICS (BUTTON, SPLITTER, TOKENS)

**Generated:** 2026-09-02  **Branch:** main  **Scope:** atomic UI library (7 refs, source-only, tokens/)

## OVERVIEW

Solid atomics: Button, Splitter, tokens (colors/spacing). Source-only; consumed by `editor-ui` and `editor`. No `dist`; flat `index.ts`.

## STRUCTURE

```
packages/ui/src/
├── index.ts
├── components/                    # button.tsx, splitter.tsx
└── tokens/                        # colors, spacing, index.ts
```

## WHERE TO LOOK

| Task | Location | Notes |
|---|---|---|
| New atomic component | `components/` | camelCase file (`button.tsx`) |
| Design tokens | `tokens/index.ts` | Internal to ui; not cross-package |

## CONVENTIONS (distinct from parent)

- Source-only; no compiled artifact.
- Token library (`tokens/`) used mainly by `ui`; other packages import from `shared` for constants.
- Flat `index.ts`; named exports only.

## ANTI-PATTERNS

- Do not put business logic or engine types here; pure atomic UI only.
- No framework-independent rule violations — this is Solid-only by design.
