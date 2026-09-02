# Sined

A modular 3D editor / engine workspace built around Solid + TypeScript + Three.js. The
architecture follows the layout in [`docs/sturct.md`](docs/sturct.md):

```
apps/editor                  Vite + Solid top-level application
packages/shared              Pure-TS utilities, math, event bus
packages/domain              Framework-independent entities + rules
packages/engine              Three.js render loop, asset pipeline, world
packages/editor-core         CommandBus, Undo/Redo, Selection, Plugin system
packages/ui                  Solid atomics (Button, Splitter, tokens)
packages/editor-ui           Editor chrome: Hierarchy / Viewport / Inspector
```

Dependency direction (strict, one-way):

```
apps/editor → editor-ui → editor-core → engine → domain → shared
                          ui ──────────────► shared
```

## Getting started

```bash
bun install
bun run dev         # starts the editor at http://localhost:5173
```

Other workspace scripts:

```bash
bun run typecheck   # tsc -b across every package
bun run build       # production build of every package that ships a build step
```

> Currently running Phase 0 (Infrastructure & Monorepo). The skeleton renders
> the editor chrome with placeholders for the Viewport, Hierarchy, Inspector
> and Asset Browser. Subsequent phases fill in the engine, commands, and
> editor features.

## Learn more

- [Solid Website](https://solidjs.com) · [Solid Discord](https://discord.com/invite/solidjs)
- [Vite docs](https://vite.dev)
