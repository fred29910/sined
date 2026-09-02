// Headless smoke test of the Phase 1 architecture. Run with `bun run scripts/smoke.ts`.
// Exercises Domain entity/Scene events and the Command cycle, without Three.
import {
  Entity,
  Scene,
  Uid,
  createCubeMesh,
  createSampleScene,
} from '@sined/domain';
import {
  AddEntityCommand,
  CommandBus,
  RemoveEntityCommand,
  SetNameCommand,
  SetTransformCommand,
} from '@sined/editor-core';

function count(s) {
  let n = 0;
  s.walk(() => (n += 1));
  return n;
}

const scene = createSampleScene();
const initial = count(scene);
console.log(`[init] scene has ${scene.rootEntities.length} root(s) and ${initial} entity(ies)`);

const events = [];
scene.addListener((e) => events.push(e));

const cube = Entity.create('Cube', Uid.from('cube_test'));
cube.addComponent(createCubeMesh(0xff0000));
const bus = new CommandBus();

await bus.execute(
  new AddEntityCommand({ scene, parentId: scene.rootEntities[0].id, entity: cube }),
);
console.log(`[add] parent now has ${scene.rootEntities[0].children.length} child(ren)`);

await bus.execute(new SetNameCommand({ scene, entityId: cube.id, newName: 'Cube Renamed' }));
console.log(`[rename] name = "${cube.getComponent('name').name}"`);

await bus.execute(
  new SetTransformCommand({ scene, entityId: cube.id, field: 'position', value: { x: 1, y: 2, z: 3 } }),
);
console.log(`[move] position = ${JSON.stringify(cube.getComponent('transform').position)}`);

await bus.execute(new RemoveEntityCommand({ scene, entityId: cube.id }));
const afterRemove = count(scene);
console.log(`[remove] scene now has ${afterRemove} entity(ies); can undo: ${bus.history.canUndo()}`);

await bus.undo();
console.log(`[undo remove] scene has ${count(scene)} entity(ies); cube present: ${scene.getEntity(cube.id.value) !== undefined}`);

await bus.undo();
console.log(`[undo move] position = ${JSON.stringify(cube.getComponent('transform').position)}`);

await bus.undo();
console.log(`[undo rename] name = "${cube.getComponent('name').name}"`);

await bus.redo();
console.log(`[redo rename] name = "${cube.getComponent('name').name}"`);

console.log(`[events] fired ${events.length} scene event(s); kinds: ${[...new Set(events.map((e) => e.kind))].join(', ')}`);
