import { createSignal, onCleanup, onMount, type JSX } from 'solid-js';
import { SceneRenderer, SceneSync } from '@sined/engine';
import { useEditorServices } from '../../app/editor-services.js';
import { colors, spacing } from '@sined/ui';

const FPS_UPDATE_MS = 500;

/**
 * Three.js viewport. On mount, the component:
 *  1. Creates a `SceneRenderer` for the canvas
 *  2. Creates a `SceneSync` and subscribes it to the Domain `Scene`
 *  3. Wires the renderer into the engine tick loop and starts the engine
 *  4. Observes parent resize to keep the framebuffer in sync
 *
 * On cleanup, the renderer is disposed and the engine stopped. Three.js
 * resources (geometry, material) are released via `disposeObject3D`.
 */
export function Viewport(): JSX.Element {
  const services = useEditorServices();
  const [stats, setStats] = createSignal({ fps: 0, entities: 0 });

  let canvasRef: HTMLCanvasElement | undefined;
  let containerRef: HTMLDivElement | undefined;

  onMount(() => {
    if (!canvasRef || !containerRef) return;

    const renderer = new SceneRenderer({ canvas: canvasRef });
    const sync = new SceneSync(services.scene, renderer.scene);
    const detachSync = sync.attach();
    const detachRender = services.engine.attachRenderer(renderer);
    services.engine.start();

    // Resize: keep the framebuffer in sync with the CSS box.
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) renderer.resize(width, height);
      }
    });
    ro.observe(containerRef);
    const initial = containerRef.getBoundingClientRect();
    if (initial.width > 0 && initial.height > 0) {
      renderer.resize(initial.width, initial.height);
    }

    // FPS counter. Track frames in a closure; refresh the visible stats
    // at a low frequency to avoid hammering the signal graph at 60Hz.
    let frameCount = 0;
    let lastFpsTick = performance.now();
    const disposeTick = services.engine.events.on('engine:tick', () => {
      frameCount += 1;
      const now = performance.now();
      const elapsed = now - lastFpsTick;
      if (elapsed >= FPS_UPDATE_MS) {
        const fps = Math.round((frameCount * 1000) / elapsed);
        frameCount = 0;
        lastFpsTick = now;
        const entityCount = countEntities(services.scene);
        setStats({ fps, entities: entityCount });
      }
    });
    const disposeScene = services.eventBus.on('scene:broadcast', () => {
      setStats((prev) => ({ ...prev, entities: countEntities(services.scene) }));
    });

    // Cleanup runs in the component's owner scope (set up by Solid's
    // runtime during render). All disposers are registered here so they
    // fire on unmount or HMR.
    onCleanup(() => {
      disposeTick();
      disposeScene();
      ro.disconnect();
      detachRender();
      detachSync();
      services.engine.stop();
      sync.dispose();
      renderer.dispose();
    });
  });

  return (
    <div
      ref={containerRef}
      data-panel="viewport"
      style={{
        position: 'relative',
        flex: '1 1 auto',
        background: '#0e1014',
        display: 'flex',
        'min-width': 0,
        'min-height': 0,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: `${spacing.sm}px`,
          left: `${spacing.sm}px`,
          padding: `${spacing.xs}px ${spacing.sm}px`,
          background: 'rgba(0,0,0,0.45)',
          color: colors.text,
          'border-radius': '4px',
          'font-size': '11px',
          'font-family': 'ui-monospace, SFMono-Regular, Menlo, monospace',
        }}
      >
        FPS: {stats().fps} · Entities: {stats().entities}
      </div>
    </div>
  );
}

function countEntities(scene: import('@sined/domain').Scene): number {
  let n = 0;
  scene.walk(() => {
    n += 1;
  });
  return n;
}
