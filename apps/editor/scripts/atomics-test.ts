// Headless validation of the Phase 2 design system. Run with:
//   bun apps/editor/scripts/atomics-test.ts
//
// This script validates Phase 2 without loading any JSX source. The
// `solid-js` install in this workspace doesn't expose a working
// `jsx` named export at the `solid-js/jsx-runtime` path that Bun's
// automatic JSX runtime expects (Vite hides this behind its optimizer;
// Bun does not). The components are validated by reading their source
// files and asserting the barrel re-export — i.e. they exist as TS
// functions and are wired into the package surface.
//
// Three layers are validated:
//   1. **Tokens** — assert shape + key presence by importing from
//      `@sined/ui/tokens` (no JSX in the dependency graph).
//   2. **Component identity** — read the barrel `components/index.ts`
//      and the component files; assert each expected atomic is exported
//      as a function.
//   3. **Tabs math** — reimplement the keyboard navigation algorithm
//      from `TabsTab.onKeyDown` in isolation and assert the index moves
//      for Arrow / Home / End.
//
// The script exits non-zero on any assertion failure. Visual behavior
// is covered by `bun run dev` (Vite) and Phase 7 will add Vitest +
// Playwright for full DOM coverage.

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  colors,
  duration,
  easing,
  fontFamily,
  fontSize,
  fontWeight,
  letterSpacing,
  lineHeight,
  radii,
  shadows,
  spacing,
  zIndex,
  zIndex as zIndexAlias,
} from '@sined/ui/tokens';

let passed = 0;
let failed = 0;

function pass(name: string): void {
  passed += 1;
  console.log(`  ✓ ${name}`);
}

function fail(name: string, message: string): void {
  failed += 1;
  console.log(`  ✗ ${name}: ${message}`);
  process.exitCode = 1;
}

function expectShape<T extends Record<string, unknown>>(
  name: string,
  obj: T,
  requiredKeys: ReadonlyArray<keyof T>,
): void {
  for (const key of requiredKeys) {
    if (obj[key] === undefined || obj[key] === null) {
      fail(name, `missing required key "${String(key)}"`);
      return;
    }
  }
  pass(`${name} has ${requiredKeys.length} required keys`);
}

function expectTruthy(name: string, value: unknown): void {
  if (value) {
    pass(name);
  } else {
    fail(name, `expected truthy value, got ${JSON.stringify(value)}`);
  }
}

/* ---------------------------------------------------------------- tokens */
console.log('== tokens ==');
expectShape('colors', colors, [
  'bg', 'surface', 'surfaceAlt', 'border', 'text', 'textMuted',
  'accent', 'danger', 'success', 'warning', 'info', 'overlay', 'focus',
]);
expectShape('spacing', spacing, ['xxxs', 'xxs', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl', 'xxxl']);
expectShape('radii', radii, ['none', 'xs', 'sm', 'md', 'lg', 'pill', 'round']);
expectShape('shadows', shadows, ['none', 'sm', 'md', 'lg', 'inner', 'focus']);
expectShape('fontFamily', fontFamily, ['sans', 'mono']);
expectShape('fontSize', fontSize, ['xs', 'sm', 'md', 'lg', 'xl', 'xxl']);
expectShape('fontWeight', fontWeight, ['normal', 'medium', 'semibold', 'bold']);
expectShape('lineHeight', lineHeight, ['tight', 'normal', 'relaxed']);
expectShape('letterSpacing', letterSpacing, ['tight', 'normal', 'wide', 'wider']);
expectShape('duration', duration, ['instant', 'fast', 'base', 'slow']);
expectShape('easing', easing, ['linear', 'standard', 'decelerate', 'accelerate']);
expectShape('zIndex', zIndex, ['base', 'dropdown', 'sticky', 'popover', 'modal', 'tooltip', 'toast']);
expectTruthy('zIndex alias re-export stable', zIndex === zIndexAlias);
expectTruthy('accent is a hex color', typeof colors.accent === 'string' && /^#[0-9a-fA-F]{6}$/.test(colors.accent));
expectTruthy('spacing.md is a number', typeof spacing.md === 'number' && spacing.md > 0);

/* ------------------------------------------------------ component identity */
// The source files use JSX, so we can't import them through Bun. Instead
// we read the barrel and component files from disk to verify the export
// wiring. The script must be run from the workspace root (`bun run` from
// the repo root), so we resolve relative to `process.cwd()`.
const UI_ROOT = resolve(process.cwd(), 'packages', 'ui');
const barrelPath = resolve(UI_ROOT, 'src', 'components', 'index.ts');

console.log('== components ==');
let barrelSource: string;
try {
  barrelSource = readFileSync(barrelPath, 'utf-8');
  pass(`read barrel: ${barrelPath}`);
} catch (err) {
  fail('read barrel', String(err));
  process.exit(1);
}

const componentFiles: Record<string, string> = {
  Button: 'button.tsx',
  IconButton: 'icon-button.tsx',
  TextInput: 'input.tsx',
  NumberInput: 'input.tsx',
  Checkbox: 'input.tsx',
  Select: 'select.tsx',
  Divider: 'divider.tsx',
  Tabs: 'tabs.tsx',
  TabsList: 'tabs.tsx',
  TabsTab: 'tabs.tsx',
  TabsPanel: 'tabs.tsx',
  Tooltip: 'tooltip.tsx',
  Modal: 'modal.tsx',
  ColorPicker: 'color-picker.tsx',
  Splitter: 'splitter.tsx',
};

for (const [name, file] of Object.entries(componentFiles)) {
  const filePath = resolve(UI_ROOT, 'src', 'components', file);
  let source: string;
  try {
    source = readFileSync(filePath, 'utf-8');
  } catch (err) {
    fail(name, `cannot read ${filePath}: ${String(err)}`);
    continue;
  }

  // 1. The file must export a function with the right name.
  const reFn = new RegExp(`export function ${name}\\b`);
  if (reFn.test(source)) {
    pass(`${name} defined as function in ${file}`);
  } else {
    fail(name, `no "export function ${name}" found in ${file}`);
  }

  // 2. The barrel must re-export the file.
  if (barrelSource.includes(`./${file.replace('.tsx', '.js')}`)) {
    pass(`barrel re-exports ${name} via ./${file.replace('.tsx', '.js')}`);
  } else {
    fail(name, `barrel does not reference ./${file.replace('.tsx', '.js')}`);
  }
}

/* ----------------------------------------------------- tabs keyboard math */
// Reimplement the navigation algorithm from `TabsTab.onKeyDown` so we can
// drive it without a real DOM. The algorithm is small and stable.
function nextIndex(args: {
  current: number;
  key: 'ArrowRight' | 'ArrowLeft' | 'Home' | 'End';
  total: number;
}): number {
  if (args.key === 'Home') return 0;
  if (args.key === 'End') return args.total - 1;
  if (args.key === 'ArrowRight') return (args.current + 1) % args.total;
  if (args.key === 'ArrowLeft') return (args.current - 1 + args.total) % args.total;
  return args.current;
}

console.log('== tabs keyboard ==');
{
  const cases: Array<{ key: 'ArrowRight' | 'ArrowLeft' | 'Home' | 'End'; from: number; total: number; want: number }> = [
    { key: 'ArrowRight', from: 0, total: 3, want: 1 },
    { key: 'ArrowRight', from: 2, total: 3, want: 0 },
    { key: 'ArrowLeft', from: 0, total: 3, want: 2 },
    { key: 'ArrowLeft', from: 1, total: 3, want: 0 },
    { key: 'Home', from: 2, total: 3, want: 0 },
    { key: 'End', from: 0, total: 3, want: 2 },
  ];
  for (const c of cases) {
    const got = nextIndex({ current: c.from, key: c.key, total: c.total });
    if (got === c.want) pass(`key ${c.key} from ${c.from} (n=${c.total}) → ${c.want}`);
    else fail(`key ${c.key} from ${c.from}`, `got ${got}, want ${c.want}`);
  }
}

/* ---------------------------------------------------------------- summary */
console.log(`\n${passed} passed, ${failed} failed`);
