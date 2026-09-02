# @SINED/UI — SOLID ATOMICS (DESIGN SYSTEM)

**Generated:** 2026-09-02  **Branch:** main  **Scope:** atomic UI library + design tokens (source-only)

## OVERVIEW

Solid atomics + design tokens. Phase 2 expanded the library from 2 placeholder components (Button, Splitter) and 2 token buckets to a full design system: 15 components, 7 token buckets, and a `tokens` subpath export for headless test scripts. Source-only; consumed by `editor-ui` and `editor`. No `dist`; flat `index.ts`.

## STRUCTURE

```
packages/ui/src/
├── index.ts                        # Package public surface
├── components/
│   ├── index.ts                    # Component barrel
│   ├── button.tsx                  # Button (variant/size/shape)
│   ├── icon-button.tsx             # Icon-only square button
│   ├── input.tsx                   # TextInput, NumberInput, Checkbox
│   ├── select.tsx                  # Select<T>
│   ├── divider.tsx                 # Divider
│   ├── tabs.tsx                    # Tabs + TabsList + TabsTab + TabsPanel
│   ├── tooltip.tsx                 # Tooltip
│   ├── modal.tsx                   # Modal (Portal-based)
│   ├── color-picker.tsx            # ColorPicker
│   └── splitter.tsx                # Splitter (Phase 0, retained)
└── tokens/
    ├── index.ts                    # Token barrel
    ├── colors.ts                   # colors + ColorToken + SemanticColor
    ├── spacing.ts                  # spacing + SpacingToken
    ├── radii.ts                    # radii + RadiusToken
    ├── shadows.ts                  # shadows + ShadowToken
    ├── typography.ts               # fontFamily / fontSize / fontWeight / lineHeight / letterSpacing
    ├── motion.ts                   # duration + easing
    └── z-index.ts                  # zIndex + ZIndexToken
```

## WHERE TO LOOK

| Task | Location | Notes |
|---|---|---|
| Add a new atomic component | `components/` | camelCase file (`button.tsx`); add to `components/index.ts` |
| Edit a design token | `tokens/<bucket>.ts` | All tokens are `as const`; type is auto-derived |
| Add a new token bucket | `tokens/<bucket>.ts` + re-export from `tokens/index.ts` |
| Headless test of atomics | `apps/editor/scripts/atomics-test.ts` | Reads source files; no DOM |
| Subpath export for headless | `@sined/ui/tokens` | Token-only path; safe for non-Vite tools |

## CONVENTIONS (distinct from parent)

- **Source-only**; no compiled artifact. Vite consumes `.tsx` directly.
- **`tokens/` is JSX-free** — that's why the `@sined/ui/tokens` subpath works under any tool. Components use JSX and can only be consumed via Vite/tsc.
- **Flat re-exports** — `index.ts` and `components/index.ts` re-export from each file; consumers import named exports only.
- **Tokens are immutable constants** (`as const`). No CSS variables, no theme provider, no runtime mutation. A future phase may add `useTheme()` if needed.
- **Components are `function` declarations** so they tree-shake well and read clearly in the barrel.
- **`Button` is the only existing component with a pre-Phase-2 contract** (variant + size). New atomics follow the same prop conventions but introduce their own as needed.

## ANTI-PATTERNS

- **Do not put business logic or engine types here**; pure atomic UI only.
- **No `as any`**, no empty `catch {}` — clean Solid + TS.
- **Do not import `editor-core` / `engine` / `domain`** — that would invert the dependency direction.
- **Do not introduce a 3rd-party UI library** (Kobalte, Ark UI, SolidUI). The roadmap's 10 Golden Rules (Rule 4: Domain/Engine = framework independent) and the monorepo's "Day 1 physical boundary" both push for self-contained atomics.
- **Do not pre-compile components** to `.js` / `.cjs`. The whole point is "source-only" — Vite / `tsc` is the consumer.

## TOKEN REFERENCE

| Bucket | Key exports |
|---|---|
| `colors` | `bg`, `surface`, `surfaceAlt`, `surfaceHover`, `border`, `borderStrong`, `text`, `textMuted`, `textInverse`, `accent`, `accentHover`, `accentActive`, `accentMuted`, `accentStrong`, `danger`, `dangerHover`, `warning`, `success`, `info`, `overlay`, `shadow`, `focus`, `transparent`, `white`, `black` |
| `spacing` | `xxxs`, `xxs`, `xs`, `sm`, `md`, `lg`, `xl`, `xxl`, `xxxl` |
| `radii` | `none`, `xs`, `sm`, `md`, `lg`, `pill`, `round` |
| `shadows` | `none`, `sm`, `md`, `lg`, `inner`, `focus` |
| `fontFamily` | `sans`, `mono` |
| `fontSize` | `xs`, `sm`, `md`, `lg`, `xl`, `xxl` |
| `fontWeight` | `normal`, `medium`, `semibold`, `bold` |
| `lineHeight` | `tight`, `normal`, `relaxed` |
| `letterSpacing` | `tight`, `normal`, `wide`, `wider` |
| `duration` | `instant`, `fast`, `base`, `slow` |
| `easing` | `linear`, `standard`, `decelerate`, `accelerate` |
| `zIndex` | `base`, `dropdown`, `sticky`, `popover`, `modal`, `tooltip`, `toast` |

## COMPONENT REFERENCE

| Component | Purpose | Key props |
|---|---|---|
| `Button` | General button | `variant`, `size`, `shape='default'\|'only'` |
| `IconButton` | Square icon-only | `variant`, `size`, requires `aria-label` |
| `TextInput` | Controlled text | `value`, `onCommit`, `size`, `invalid` |
| `NumberInput` | Controlled number | `value`, `onCommit`, `step`, `min`, `max`, `size`, `invalid` |
| `Checkbox` | Controlled boolean | `checked`, `onChange`, `indeterminate`, `disabled` |
| `Select<T>` | Controlled native select | `value`, `options[]`, `onChange`, `size`, `invalid` |
| `Divider` | Separator | `orientation`, `inset` |
| `Tabs` + `TabsList` + `TabsTab` + `TabsPanel` | Tabbed UI with keyboard nav | `value`, `onChange`; `TabsTab`: `value`, `disabled` |
| `Tooltip` | CSS-only hover/focus tip | `content`, `show`, `placement`, `id` |
| `Modal` | Portal-based dialog | `open`, `onClose`, `title`, `footer`, `dismissible`, `width` |
| `ColorPicker` | Native + hex input | `value`, `onChange`, `size` |
| `Splitter` | Draggable divider | `orientation`, `align`, `targetRef`, `onChange`, `onChangePx` |

## NOTES

- `apps/editor/scripts/atomics-test.ts` runs as a CI guard: token shape, component barrel wiring, Tabs keyboard math. Run with `bun apps/editor/scripts/atomics-test.ts` from the workspace root.
- `Modal` is the only component that depends on `solid-js/web` (for `Portal`). Everything else uses only `solid-js` core.
- The `@sined/ui/tokens` subpath was added in Phase 2 so headless tools (Bun scripts, future Vitest tests) can import tokens without dragging the JSX-bearing component barrel through their loader.
- Phase 2 deliberately avoids a full design system (no ThemeProvider, no CSS variables, no dark/light toggle). Static constants keep the bundle small and the build fast.
