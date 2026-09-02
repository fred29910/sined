/* @refresh reload */
import { render } from 'solid-js/web';
import './styles.css';
import { App } from './App.js';

const root = document.getElementById('root');
if (!root) {
  throw new Error('Sined Editor: missing #root element in index.html');
}

render(() => <App />, root);
