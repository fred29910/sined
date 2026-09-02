# @SINED/DOMAIN — FRAMEWORK-INDEPENDENT ENTITIES / RULES

**Generated:** 2026-09-02  **Branch:** main  **Scope:** entities / events (9 refs, zero dependencies)

## OVERVIEW

Framework-independent entities, value objects, domain rules, events. Zero dependencies (`package.json`: no deps except possibly none). Foundation for engine and editor-core.

## STRUCTURE

```
packages/domain/src/
├── index.ts
├── entities/                     # Domain entities
└── events/                       # Domain events
```

## WHERE TO LOOK

| Task | Location | Notes |
|---|---|---|
| New domain entity | `entities/` | Must not import `solid-js`, `three`, or `editor-core` |
| Domain events | `events/` | Used by engine / core via event bus (`shared`) |

## CONVENTIONS

- Zero dependencies — if a module needs `three` or `solid-js`, it belongs in engine/ui, not domain.
- Entities are pure data + rules; no render or command logic.

## ANTI-PATTERNS

- Never import framework packages (`solid-js`, `three`) into domain.
- Dependency direction: `engine → domain → shared`; `editor-core → engine`; never reverse.
