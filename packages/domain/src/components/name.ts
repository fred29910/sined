import { ComponentBase } from './component.js';

export interface NameComponent extends ComponentBase<'name'> {
  name: string;
}

export function createName(name: string): NameComponent {
  return { kind: 'name', name };
}
