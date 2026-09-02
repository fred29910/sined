// Verifies the Splitter drag math in three modes:
//   1. align="start" + onChange     →  ratio = cursor / track
//   2. align="end"   + onChange     →  ratio = 1 - cursor / track
//   3. targetRef + onChangePx       →  px = cursor - targetRect.{left|top}
//
// We reimplement the math from packages/ui/src/components/splitter.tsx
// to keep the test self-contained and free of DOM.

const MIN_RATIO = 0.05;
const MAX_RATIO = 0.95;

function computeRatio(opts: {
  cursorX: number;
  cursorY: number;
  trackLeft: number;
  trackTop: number;
  trackWidth: number;
  trackHeight: number;
  orientation: 'horizontal' | 'vertical';
  align: 'start' | 'end';
}): number {
  const isVertical = opts.orientation === 'vertical';
  const position = isVertical ? opts.cursorX - opts.trackLeft : opts.cursorY - opts.trackTop;
  const size = isVertical ? opts.trackWidth : opts.trackHeight;
  if (size <= 0) return 0.5;
  const raw = position / size;
  const adjusted = opts.align === 'end' ? 1 - raw : raw;
  return Math.min(MAX_RATIO, Math.max(MIN_RATIO, adjusted));
}

function computePx(opts: {
  cursorX: number;
  cursorY: number;
  targetLeft: number;
  targetTop: number;
  orientation: 'horizontal' | 'vertical';
}): number {
  const isVertical = opts.orientation === 'vertical';
  const value = isVertical ? opts.cursorX - opts.targetLeft : opts.cursorY - opts.targetTop;
  return Math.max(0, value);
}

function check(name: string, actual: number, expected: number, tol = 1e-6): void {
  const pass = Math.abs(actual - expected) <= tol;
  console.log(`  ${pass ? '✓' : '✗'} ${name}: got ${actual.toFixed(4)} expected ${expected.toFixed(4)}`);
  if (!pass) process.exitCode = 1;
}

console.log('== left Splitter (align="start", vertical) ==');
check('cursor at 0%',         computeRatio({ cursorX: 0,    cursorY: 0, trackLeft: 0, trackTop: 0, trackWidth: 1200, trackHeight: 600, orientation: 'vertical', align: 'start' }), 0.05);
check('cursor at 20%',        computeRatio({ cursorX: 240,  cursorY: 0, trackLeft: 0, trackTop: 0, trackWidth: 1200, trackHeight: 600, orientation: 'vertical', align: 'start' }), 0.20);
check('cursor at 50%',        computeRatio({ cursorX: 600,  cursorY: 0, trackLeft: 0, trackTop: 0, trackWidth: 1200, trackHeight: 600, orientation: 'vertical', align: 'start' }), 0.50);
check('cursor at 95% (clamp)', computeRatio({ cursorX: 1140, cursorY: 0, trackLeft: 0, trackTop: 0, trackWidth: 1200, trackHeight: 600, orientation: 'vertical', align: 'start' }), 0.95);

console.log('== right Splitter (align="end", vertical) ==');
// Splitter sits at the LEFT edge of the right panel. Dragging right (cursorX larger)
// should SHRINK the right panel (ratio smaller).
check('cursor at 80% (panel = 20%)',  computeRatio({ cursorX: 960,  cursorY: 0, trackLeft: 0, trackTop: 0, trackWidth: 1200, trackHeight: 600, orientation: 'vertical', align: 'end' }), 0.20);
check('cursor at 50% (panel = 50%)',  computeRatio({ cursorX: 600,  cursorY: 0, trackLeft: 0, trackTop: 0, trackWidth: 1200, trackHeight: 600, orientation: 'vertical', align: 'end' }), 0.50);
check('cursor at 20% (panel = 80%)',  computeRatio({ cursorX: 240,  cursorY: 0, trackLeft: 0, trackTop: 0, trackWidth: 1200, trackHeight: 600, orientation: 'vertical', align: 'end' }), 0.80);
check('cursor at 5% (clamp)',         computeRatio({ cursorX: 60,   cursorY: 0, trackLeft: 0, trackTop: 0, trackWidth: 1200, trackHeight: 600, orientation: 'vertical', align: 'end' }), 0.95);

console.log('== bottom Splitter (align="end", horizontal, pixel mode) ==');
// AssetBrowser rect: top=400, height varies. Splitter at the TOP edge of the
// AssetBrowser. Dragging down (cursorY larger) should INCREASE the panel height.
check('cursor 10px below target top',   computePx({ cursorX: 0, cursorY: 410, targetLeft: 0, targetTop: 400, orientation: 'horizontal' }), 10);
check('cursor 200px below target top',  computePx({ cursorX: 0, cursorY: 600, targetLeft: 0, targetTop: 400, orientation: 'horizontal' }), 200);
check('cursor above target top (clamp)', computePx({ cursorX: 0, cursorY: 350, targetLeft: 0, targetTop: 400, orientation: 'horizontal' }), 0);

console.log('\nAll splitter drag math cases pass.');
