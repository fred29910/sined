# EDITOR APP — VITE + SOLID ENTRY

**Generated:** 2026-09-02  **Branch:** main  **Scope:** entry app (port 5273, assembles chrome + engine)

## OVERVIEW

Top-level Vite + Solid application. Assembles `editor-ui`, `ui`, `engine`, `shared`. Only app with `dev` script (`bun --filter editor dev`). Build outputs to `dist/assets/`.

## STRUCTURE

```
apps/editor/src/
├── App.tsx                      # Entry assembly
├── index.tsx                    # Mount
└── styles.css
```

## WHERE TO LOOK

| Task | Location | Notes |
|---|---|---|
| App assembly / routing | `App.tsx` | Imports chrome + engine via workspace links |
| Entry / bootstrap | `index.tsx` | Solid mount point |
| Build / dev config | `vite.config.ts` (un-ignored) | Port ~5273 |

## CONVENTIONS

- Only app that uses `vite`; all packages are source-only.
- `bun --filter editor dev` launches only this app.
- Dependency direction enforced: app → editor-ui → editor-core → engine → domain → shared.

## ANTI-PATTERNS

- Do not import `packages/` by relative path — use workspace package names (`@sined/editor-ui`) per `package.json` exports.
- No `package-lock.json`; use `bun.lock`.

## NOTES

- `dist/` (36 items) is build output; ignored by `.gitignore` except un-ignored assets.
- `public/` holds static assets; copied to `dist/` by Vite.
