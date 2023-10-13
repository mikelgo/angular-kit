import { isObjectGuard } from './_internals/guards';

/**
 * @description
 * Merges an object of type T with updates of type Partial<T>.
 * Returns a new object where updates override original values while not mutating the original one.

 * @example
 * interface Creature {
 *  id: number,
 *  type: string,
 *  name: string
 * }
 *
 * const cat = {id: 1, type: 'cat'};
 *
 * const catWithname = patch(cat, {name: 'Fluffy'});
 *
 * // catWithname will be:
 * // {id: 1, type: 'cat', name: 'Fluffy'};
 *
 * @returns T
 */
export function patch<T extends object>(object: T, upd: Partial<T>): T {
  const update = isObjectGuard(upd) ? upd : {};

  if (!isObjectGuard(object) && isObjectGuard(upd)) {
    console.warn(`Patch: original value ${object} is not an object.`);
    return { ...update } as T;
  }

  if (!isObjectGuard(object) && !isObjectGuard(upd)) {
    console.warn(`Patch: original value ${object} and updates ${upd} are not objects.`);
    return object;
  }

  return { ...object, ...update };
}
