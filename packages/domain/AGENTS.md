# @SINED/DOMAIN — FRAMEWORK-INDEPENDENT ENTITIES / RULES

**Generated:** 2026-09-02  **Branch:** main  **Commit:** HEAD  **Scope:** entities / events / components / rules / factories / value-objects (11 source files, 9 refs, zero dependencies)

## OVERVIEW

Framework-independent entities, value objects, domain rules, events. Zero dependencies (`package.json`: no deps except possibly none). Foundation for engine and editor-core.

## STRUCTURE

```
packages/domain/src/
├── index.ts                        # Flat re-export: uid, entities, events, rules, factories, components
├── entities/                       # Domain entities (entity, scene)
├── events/                         # Domain events (scene-events)
├── components/                     # Component definitions (component, mesh, name, transform)
├── rules/                          # Domain rules (scene-rules)
├── factories/                      # Scene factories (sample-scene)
└── value-objects/                  # Value objects (uid)
```

## WHERE TO LOOK

| Task | Location | Notes |
|---|---|---|
| New domain entity | `entities/` | Must not import `solid-js`, `three`, or `editor-core` |
| Domain events | `events/` | Used by engine / core via event bus (`shared`) |
| Component definitions | `components/` | Component, Mesh, Name, Transform |
| Scene rules | `rules/` | `scene-rules.ts` — domain constraints |
| Scene factories | `factories/` | `sample-scene.ts` — initial scene setup |
| Value objects (UID) | `value-objects/` | `uid.ts` — framework-independent identifier |

## CONVENTIONS

- Zero dependencies — if a module needs `three` or `solid-js`, it belongs in engine/ui, not domain.
- Entities are pure data + rules; no render or command logic.
- `components/` defines domain component shapes (not UI components); `rules/` enforces domain constraints; `factories/` creates initial scenes; `value-objects/` holds framework-independent identifiers.

## ANTI-PATTERNS

- Never import framework packages (`solid-js`, `three`) into domain.
- Dependency direction: `engine → domain → shared`; `editor-core → engine`; never reverse.
