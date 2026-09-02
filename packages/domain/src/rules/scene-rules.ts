import { Entity } from '../entities/entity.js';
import { Scene } from '../entities/scene.js';

/**
 * Pure validation rules for a `Scene`. Each rule returns `null` on success
 * or a human-readable error string on failure so the caller can decide how
 * to surface the violation (toast, command rejection, etc).
 */
export type RuleViolation = string | null;

export const SceneRules = {
  uniqueEntityNames(scene: Scene): RuleViolation {
    const seen = new Set<string>();
    const walk = (e: Entity): RuleViolation => {
      const name = e.getComponent('name')?.name;
      if (name) {
        if (seen.has(name)) return `Duplicate entity name: "${name}"`;
        seen.add(name);
      }
      for (const c of e.children) {
        const v = walk(c);
        if (v) return v;
      }
      return null;
    };
    for (const root of scene.rootEntities) {
      const v = walk(root);
      if (v) return v;
    }
    return null;
  },

  atMostOneRoot(scene: Scene, allowMultiple = true): RuleViolation {
    if (allowMultiple) return null;
    return scene.rootEntities.length <= 1
      ? null
      : 'A single-root scene may only contain one root entity.';
  },
};
