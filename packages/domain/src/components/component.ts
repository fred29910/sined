/**
 * Discriminated tag interface for ECS-style components. Concrete components
 * carry their own payload; the type tag lets `Entity.getComponent` perform
 * exhaustive narrowing via the `kind` discriminant.
 */
export type ComponentKind =
  | 'transform'
  | 'name'
  | 'mesh';

export interface ComponentBase<K extends ComponentKind> {
  readonly kind: K;
}
