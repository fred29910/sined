/* @refresh reload */
import { render } from 'solid-js/web';
import './styles.css';
import { App } from './App.js';
import { setDefaultLogLevel } from '@sined/shared';

// Configure the global default log level before any module grabs a logger.
// `setDefaultLevel` (unlike `setLevel`) is intentionally non-persistent so
// the user's last dev-tools override is not clobbered across reloads.
setDefaultLogLevel(import.meta.env.DEV ? 'info' : 'warn');

const root = document.getElementById('root');
if (!root) {
  throw new Error('Sined Editor: missing #root element in index.html');
}

render(() => <App />, root);
