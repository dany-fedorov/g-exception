// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { ConfigurableDeepCloner, GCDPrototypeBehavior } from '../src/configurable-deep-cloner';

async function main() {
  const cloner = new ConfigurableDeepCloner();
  console.time('t');
  const op = { c: 23 };
  const o = Object.create(op);
  Object.assign(o, { a: 1, [Symbol('f')]: 'f1' });
  const c = cloner.clone([1, 2, 3], {
    prototypeBehavior: GCDPrototypeBehavior.CLONE_PROTOTYPE,
  });
  console.timeEnd('t');
  console.log(c);
  op.c2 = 231;
  console.log(c.cloned.c2);
}

main();
