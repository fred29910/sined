import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';
import { resolve } from 'node:path';

function modulePathTransform(relativeSourcePath: string): string {
  // Convert file-system relative paths to module paths
  // e.g., ../../../../packages/shared/src/utils/id.ts -> @sined/shared/utils/id
  const pkgMap: Record<string, string> = {
    'packages/shared/src/': '@sined/shared',
    'packages/domain/src/': '@sined/domain',
    'packages/engine/src/': '@sined/engine',
    'packages/editor-core/src/': '@sined/editor-core',
    'packages/editor-ui/src/': '@sined/editor-ui',
    'packages/ui/src/': '@sined/ui',
  };
  for (const [key, value] of Object.entries(pkgMap)) {
    if (relativeSourcePath.includes(key)) {
      const rest = relativeSourcePath.split(key)[1] || '';
      return value + (rest ? '/' + rest.replace(/\.ts(x)?$/, '') : '');
    }
  }
  // Keep node_modules as-is but use module name from basename
  if (relativeSourcePath.includes('node_modules/')) {
    const parts = relativeSourcePath.split('node_modules/');
    const modulePath = parts[parts.length - 1] || relativeSourcePath;
    return modulePath.replace(/\.js$/, '');
  }
  return relativeSourcePath;
}

export default defineConfig({
  plugins: [solid()],
  server: {
    port: 5273,
    strictPort: false,
  },
  build: {
    target: 'es2022',
    sourcemap: true,
    rollupOptions: {
      output: {
        sourcemapPathTransform(relativeSourcePath, sourcemapPath) {
          return modulePathTransform(relativeSourcePath);
        },
        manualChunks(id): string | undefined {
          if (id.includes('node_modules/three')) {
            return 'three';
          }
          if (id.includes('@sined/editor-core') || id.includes('packages/editor-core')) {
            return 'editor-core';
          }
          if (id.includes('@sined/ui') || id.includes('packages/ui')) {
            return 'design-system';
          }
          if (id.includes('solid-js')) {
            return 'solid-runtime';
          }
          return undefined;
        },
      },
    },
  },
});
