import type { JSX } from 'solid-js';
import { AppProviders, EditorLayout } from '@sined/editor-ui';

export function App(): JSX.Element {
  return (
    <AppProviders>
      <EditorLayout />
    </AppProviders>
  );
}
