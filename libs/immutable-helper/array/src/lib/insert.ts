import { isDefined } from './_internals/guards';

/**
 * @description
 * Inserts one or multiple items to an array T[].
 * Returns a shallow copy of the updated array T[], and does not mutate the original one.
 *
 * @example
 * // Inserting single value
 *
 * const creatures = [{id: 1, type: 'cat'}, {id: 2, type: 'dog'}];
 *
 * const updatedCreatures = insert(creatures, {id: 3, type: 'parrot'});
 *
 * // updatedCreatures will be:
 * //  [{id: 1, type: 'cat'}, {id: 2, type: 'dog}, {id: 3, type: 'parrot}];
 *
 * @example
 * // Inserting multiple values
 *
 * const creatures = [{id: 1, type: 'cat'}, {id: 2, type: 'dog'}];
 *
 * const updatedCreatures = insert(creatures, [{id: 3, type: 'parrot'}, {id: 4, type: 'hamster'}]);
 *
 * // updatedCreatures will be:
 * // [{id: 1, type: 'cat'}, {id: 2, type: 'dog'}, {id: 3, type: 'parrot'}, {id: 4, type: 'hamster'}];
 *
 * @returns T[]
 *
 */
export function insert<T>(source: T[], updates: T | T[]): T[] {
  const updatesDefined = isDefined(updates);
  const sourceIsNotArray = !Array.isArray(source);
  const invalidInput = sourceIsNotArray && !updatesDefined;

  if (sourceIsNotArray && isDefined(source)) {
    console.warn(`Insert: Original value (${source}) is not an array.`);
  }

  if (invalidInput) {
    return source;
  }

  return (sourceIsNotArray ? [] : source).concat(updatesDefined ? (Array.isArray(updates) ? updates : [updates]) : []);
}
