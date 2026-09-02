# SINED MONOREPO — PROJECT KNOWLEDGE BASE

**Generated:** 2026-09-02  **Branch:** main  **Commit:** HEAD  **Mode:** update (updated per actual project state: domain structure corrected, .jsx.map artifacts noted, root structure refreshed)

## OVERVIEW

Solid + TypeScript + Three.js modular 3D editor / engine workspace (`sined-monorepo`).
- **Phase 1** (complete): Domain / Engine / EditorCore / chrome skeleton online. CommandBus, Undo/Redo, Three.js Viewport render loop.
- **Phase 2** (complete): `@sined/ui` is now a full design system — 15 atomic components, 7 token buckets. `editor-ui` chrome rewired to use `IconButton` / `Button` / `Tabs` / `TextInput` / `NumberInput` from `@sined/ui`; inline `inputs.tsx` removed.
- **Phase 3+**: Viewport gizmo / Inspector bridge, asset pipeline, persistence, plugin engine.

Strict one-way dependency graph (`editor → editor-ui → editor-core → engine → domain → shared`; `ui → shared`).

## STRUCTURE

```
.
├── apps/editor/          # Vite + Solid entry app (App.tsx, styles.css) + headless test scripts
├── packages/
│   ├── domain/           # Framework-independent entities / rules (zero deps)
│   ├── engine/           # Three.js render loop, ECS, asset pipeline
│   ├── editor-core/      # CommandBus, Undo/Redo, Selection, Plugin (353-line hotspot)
│   ├── editor-ui/        # Editor chrome: Hierarchy / Viewport / Inspector (feature dirs depth 4)
│   ├── ui/               # Solid atomics (15 components + 7 token buckets; `@sined/ui/tokens` subpath)
│   └── shared/           # Pure-TS utilities, math, event bus, logging (flat index, 17 refs)
├── docs/
│   └── sturct.md         # Architecture doc (typo in filename; mermaid diagrams)
├── scripts/
│   └── smoke.mjs         # Headless CommandBus/undo/redo test (no Three.js)
├── public/               # Static assets
├── package.json          # Bun workspace (apps/*, packages/*); type=module; ES2022
├── bunfig.toml           # Workspace install (exact=false, auto=auto)
├── tsconfig.base.json    # strict=true, noUnusedLocals/Parameters=true, module=ESNext, moduleResolution=bundler
└── bun.lock              # Bun lockfile (not npm/pnpm)
```

Hidden / non-obvious:
- `apps/editor/dist/` — build output (~7 items: assets/, index.html, favicon.svg, icons.svg); `node_modules` at root + per package.
- `.bun-tmp/` — Bun compile cache (excluded in `.gitignore`).
- `packages/ui/` and `packages/editor-ui/` — overlapping naming; `ui` = atomics, `editor-ui` = chrome.
- `apps/editor/scripts/atomics-test.ts` — headless Phase 2 design-system guard (token shape, component barrel, Tabs keyboard math).
- No `.github/workflows/`, no `Makefile`, no deploy config.
- `.jsx.map` artifacts exist in some `src/` dirs (`packages/ui/src/components/`, `packages/editor-ui/src/features/`) — Vite build source maps, not source code; ignore for code search.

## WHERE TO LOOK

| Task | Location | Notes |
|---|---|---|
| UI chrome / features | `packages/editor-ui/src/features/` | Feature-first at depth 4: `hierarchy/`, `inspector/`, `viewport/`, `asset-browser/` |
| Commands / Undo / Plugin | `packages/editor-core/src/commands/` | Hotspot: `scene-commands.ts` (353 lines) |
| 3D / ECS / Render | `packages/engine/src/core/`, `ecs/`, `render/`, `assets/` | Source-only package (no build step) |
| Entities / Domain rules | `packages/domain/src/` | Zero deps; `entities/`, `events/`, `components/`, `rules/`, `factories/`, `value-objects/` |
| Shared utils / math / types | `packages/shared/src/` | Flat `index.ts`; `math/vec3`, `types/event-bus`, `constants/engine` |
| Atomic UI components | `packages/ui/src/components/` | 15 components: `Button`, `IconButton`, `TextInput`, `NumberInput`, `Checkbox`, `Select`, `Divider`, `Tabs`, `TabsList`, `TabsTab`, `TabsPanel`, `Tooltip`, `Modal`, `ColorPicker`, `Splitter` |
| Design tokens | `packages/ui/src/tokens/` | 7 buckets: `colors`, `spacing`, `radii`, `shadows`, `typography`, `motion`, `zIndex` |
| App assembly / routing | `apps/editor/src/App.tsx`, `index.tsx` | Vite (port 5273), Solid plugin |
| Architecture doc | `docs/sturct.md` | Mermaids; typo filename; Phase 0 → Phase 2 status |
| Headless tests | `apps/editor/scripts/` | `smoke.ts` (Phase 1), `splitter-math-test.ts`, `atomics-test.ts` (Phase 2) |

## CODE MAP (from codegraph + package index traces)

| Symbol / Module | Type | Location | Refs / Role |
|---|---|---|---|
| `@sined/shared` | package export | `packages/shared/src/index.ts` | 17 refs — cross-cutting utilities; flat re-export |
| `@sined/domain` | package export | `packages/domain/src/index.ts` | 9 refs — entities, framework-independent |
| `@sined/engine` | package export | `packages/engine/src/index.ts` | 3 refs — Three.js render / ECS |
| `@sined/editor-core` | package export | `packages/editor-core/src/index.ts` | 3 refs — CommandBus, Undo, Plugin |
| `@sined/ui` | package export | `packages/ui/src/index.ts` | 7 refs — Solid atomics |
| `editor-ui` (chrome) | package export | `packages/editor-ui/src/index.ts` | Feature dirs; depth-4 split |
| `App.tsx` | component | `apps/editor/src/App.tsx` | Entry; assembles chrome + engine |
| `scene-commands.ts` | module | `packages/editor-core/src/commands/` | 353 lines — largest source file; command hotspot |
| `event-bus.ts` | module | `packages/shared/src/types/` | Cross-package event bus |
| `constants/engine.ts` | constants | `packages/shared/src/constants/` | Shared engine constants |

Reference centrality (package source only, top): `@sined/shared` (17) > `solid-js` (13) > `@sined/domain` (9) > `@sined/ui` (7) > `editor-services` (4) > `three` / `@sined/engine` / `@sined/editor-core` (3 each).

Dependency direction (strict, one-way — enforced by workspace + architecture):
`apps/editor → editor-ui → editor-core → engine → domain → shared`; `ui → shared`; `editor-ui → ui / shared`.

## CONVENTIONS (this project — deviations from generic)

- **TypeScript**: `strict: true`, `noUnusedLocals: true`, `noUnusedParameters: true`, `noFallthroughCasesInSwitch: true`, `isolatedModules: true`, `forceConsistentCasingInFileNames: true`, `target=ES2022`, `module=ESNext`, `moduleResolution=bundler`. No `.eslintrc`, no `.prettier*`, no `.editorconfig` — lint/format not configured.
- **Build**: Bun workspace (`bunfig.toml`: `exact=false`, `auto=auto`). Root scripts: `dev` (filter editor), `build` (filter `*`), `typecheck` (`tsc -b`), `clean` (rm `packages/*/dist apps/*/dist`). Per-package `build` is mostly `echo 'source-only'` for `engine`/`ui`; `editor` uses Vite.
- **Module**: `type: "module"`; `exports: { ".": "./src/index.ts" }` in all packages; flat `index.ts` re-exports (no nested namespaces).
- **Naming**: camelCase files (`button.tsx`, `command.d.ts`), PascalCase classes (inferred from `.d.ts`), feature-dir names (`hierarchy/`, `inspector/`).
- **Directory**: Feature-first at depth 4 (features vs commands vs entities vs components). Technical dirs (`commands/`, `components/`, `entities/`, `events/`) sit under package `src/`; user-facing features sit under `packages/editor-ui/src/features/`.
- **Source-only packages**: `engine` and `ui` do not ship compiled artifacts; consumed via Vite / `tsc` directly.
- **Git ignore**: `dist/`, `node_modules/`, `.bun-tmp/`, `**/*.tsbuildinfo`, Vite HMR artifacts `.jsx/.js/.d.ts` siblings; explicitly un-ignores `vite.config.ts` and `packages/**/*.ts`.

## ANTI-PATTERNS (THIS PROJECT — explicitly forbidden / noted)

- **No `as any` suppressions** found in `src/` / `packages/`. Do not introduce.
- **No empty `catch {}` blocks** found.
- **No `DO NOT / NEVER / ALWAYS` forbidden rules in source** — hits in `packages/engine/src/sync/scene-sync.ts:21` (`never call`) and `packages/shared/src/utils/result.ts` (`never` type) are design constraints / legitimate `Result` type, not anti-patterns.
- **No full test suite** — no vitest / jest config. Phase 1 uses `scripts/smoke.mjs` + `apps/editor/scripts/smoke.ts` + `apps/editor/scripts/splitter-math-test.ts`. Phase 2 adds `apps/editor/scripts/atomics-test.ts`. Phase 7 will add Vitest + Playwright.
- **No `.github/workflows`** — CI not configured; rely on `bun run typecheck` + the headless scripts above.
- **Dependency direction is one-way** — never import `shared` from `domain` in reverse, or `editor-core` from `engine`; architecture doc (`docs/sturct.md`) defines strict order.
- **No `pnpm` / `npm`** — use `bun` and `bun.lock`; do not commit `package-lock.json`.
- **No top-level `components/` in `editor-ui`** — feature-first required. Atomic UI lives in `@sined/ui`.

## UNIQUE STYLES

- **Feature-first depth-4**: `packages/editor-ui/src/features/inspector/components/`, `packages/editor-ui/src/features/inspector/state/`, `packages/editor-ui/src/features/inspector/commands/` — split by domain inside feature, not by tech type.
- **Flat re-export boundary**: Every package exposes a single `index.ts`; submodules import named exports, not nested paths, to keep public API scannable.
- **Source-only + Vite consumption**: `engine` and `ui` have no `dist`; `editor` assembles via Vite + workspace links.
- **Subpath tokens export**: `@sined/ui/tokens` re-exports only the JSX-free `tokens/` barrel, so headless tools (Bun, future Vitest) can import tokens without pulling the JSX component graph through their loader.
- **Headless test scripts** (replacing a full test suite for now): `scripts/smoke.mjs`, `apps/editor/scripts/smoke.ts`, `apps/editor/scripts/splitter-math-test.ts`, `apps/editor/scripts/atomics-test.ts`.

## COMMANDS

```bash
bun install              # Bun workspace install (respects bunfig.toml)
bun run dev              # Vite dev server (editor app only, port ~5273)
bun run build            # Build all workspace packages (mostly echo for engine/ui)
bun run typecheck        # tsc -b across all tsconfig.json
bun run clean            # Remove all dist/ outputs

# Headless validation
bun scripts/smoke.mjs                           # Phase 1 CommandBus cycle
bun apps/editor/scripts/smoke.ts                 # Phase 1 app-level cycle
bun apps/editor/scripts/splitter-math-test.ts    # Splitter drag math
bun apps/editor/scripts/atomics-test.ts          # Phase 2 design system
```

Per-package:
- `packages/editor-core`: source + typecheck; commands in `src/commands/` (hotspot `scene-commands.ts`)
- `packages/engine`: source-only; `core/`, `ecs/`, `render/`, `assets/`, `sync/`
- `packages/shared`: flat re-export; `utils/`, `math/`, `types/`, `constants/`, `logging/`
- `packages/ui`: source-only; atomic components in `components/`, design tokens in `tokens/`; `@sined/ui/tokens` subpath for headless consumers.

## NOTES / GOTCHAS

- **Phase 2 status**: `@sined/ui` is a full design system. Editor chrome is wired to consume atomics from `@sined/ui`. Phase 3+ work is the gizmo/Inspector bridge, asset pipeline, persistence, plugins.
- `docs/sturct.md` has typo filename (`sturct` not `structure`) — reference by exact name.
- `packages/editor-ui` vs `packages/ui` naming overlap: `ui` = atomic design system; `editor-ui` = editor chrome / feature assembly.
- Bun's automatic JSX runtime does not work against the current `solid-js` install (no `jsx` named export at `solid-js/jsx-runtime`). Vite masks this via its optimizer; headless Bun scripts avoid the issue by importing the JSX-free `@sined/ui/tokens` subpath and reading component source for barrel validation.
- `bun --filter editor dev` targets only edit app; `bun --filter '*' build` builds all.
- `.codegraph/codegraph.db` exists — codegraph index available; LSP not configured (`lsp_status` empty). Use `codegraph_explore` for symbol/impact queries.
- `public/` holds static assets; build puts compiled assets under `apps/editor/dist/assets/`.

---

Hierarchy:
- `./AGENTS.md`
- `├── apps/editor/AGENTS.md`
- `├── packages/shared/AGENTS.md`
- `├── packages/editor-core/AGENTS.md`
- `├── packages/engine/AGENTS.md`
- `├── packages/editor-ui/AGENTS.md`
- `├── packages/domain/AGENTS.md`
- `└── packages/ui/AGENTS.md`
