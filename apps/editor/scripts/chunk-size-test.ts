// TDD verification script for chunk-size fix. Must go RED before fix, GREEN after.
// Run: `bun apps/editor/scripts/chunk-size-test.ts`
// It executes `vite build`, finds the emitted chunk, and asserts size < 500_000 bytes.

import { execSync } from 'node:child_process';
import { existsSync, statSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const DIST_DIR = resolve(process.cwd(), 'apps', 'editor', 'dist', 'assets');

function findChunkFile(): string | null {
  if (!existsSync(DIST_DIR)) return null;
  const files = readdirSync(DIST_DIR).filter((f) => f.endsWith('.js') && !f.endsWith('.map'));
  if (files.length === 0) return null;
  // Return the largest chunk file name (main bundle)
  files.sort((a, b) => statSync(resolve(DIST_DIR, b)).size - statSync(resolve(DIST_DIR, a)).size);
  return resolve(DIST_DIR, files[0]);
}

console.log('== chunk-size verification (TDD: RED before fix, GREEN after) ==');

// RED step: build and measure current state
console.log('Running build...');
try {
  execSync('bun run build', { cwd: resolve(process.cwd(), 'apps', 'editor'), encoding: 'utf-8', stdio: 'inherit' });
} catch (e) {
  console.log('Build exited with error');
  process.exit(1);
}

const chunkPath = findChunkFile();
if (!chunkPath) {
  console.log('✗ FAIL: no chunk file found in ' + DIST_DIR);
  process.exit(1);
}

const chunkSize = statSync(chunkPath).size;
console.log('Chunk file:', chunkPath);
console.log('Chunk size (bytes):', chunkSize);
console.log('Chunk size (kB):', (chunkSize / 1024).toFixed(2));

if (chunkSize < 500_000) {
  console.log('✓ PASS: chunk < 500 kB');
  process.exitCode = 0;
} else {
  console.log('✗ FAIL: chunk >= 500 kB (warning threshold exceeded)');
  process.exitCode = 1;
}
