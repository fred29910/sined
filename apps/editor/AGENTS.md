# EDITOR APP — VITE + SOLID ENTRY

**Generated:** 2026-09-02  **Branch:** main  **Scope:** entry app (port 5273, assembles chrome + engine)

## OVERVIEW

Top-level Vite + Solid application. Assembles `editor-ui`, `ui`, `engine`, `shared`. Only app with `dev` script (`bun --filter editor dev`). Build outputs to `dist/assets/`.

## STRUCTURE

```
apps/editor/
├── src/
│   ├── App.tsx                      # Entry assembly
│   ├── index.tsx                    # Mount
│   └── styles.css
├── scripts/
│   ├── smoke.ts                     # Headless Phase 1 smoke (CommandBus / Undo / Redo)
│   ├── splitter-math-test.ts        # Headless Splitter drag math regression
│   └── atomics-test.ts             # Phase 2 atomic / token validation
```

## WHERE TO LOOK

| Task | Location | Notes |
|---|---|---|
| App assembly / routing | `src/App.tsx` | Imports chrome + engine via workspace links |
| Entry / bootstrap | `src/index.tsx` | Solid mount point |
| Build / dev config | `vite.config.ts` (un-ignored) | Port ~5273 |
| Headless validation | `scripts/` | Phase 1 smoke + Phase 2 atomics test |

## CONVENTIONS

- Only app that uses `vite`; all packages are source-only.
- `bun --filter editor dev` launches only this app.
- Dependency direction enforced: app → editor-ui → editor-core → engine → domain → shared.

## ANTI-PATTERNS

- Do not import `packages/` by relative path — use workspace package names (`@sined/editor-ui`) per `package.json` exports.
- No `package-lock.json`; use `bun.lock`.

## NOTES

- `dist/` is build output (assets/, index.html, favicon.svg, icons.svg — ~7 items); ignored by `.gitignore` except un-ignored assets.
- `public/` (repo root) holds static assets; copied to `dist/` by Vite.
- `scripts/atomics-test.ts` (Phase 2) is the CI guard for the design system: token shape, component barrel wiring, and Tabs keyboard math. Run with `bun apps/editor/scripts/atomics-test.ts` from the workspace root.
- The `tsconfig.json` `include` covers `src` + `scripts` so the test scripts participate in `bun run typecheck`.
