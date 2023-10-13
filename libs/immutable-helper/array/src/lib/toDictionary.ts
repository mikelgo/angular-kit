import { isDefined, isKeyOf, OnlyKeysOfSpecificType } from './_internals/guards';

/**
 * @description
 * Converts an array of objects to a dictionary {[key: string]: T}.
 * Accepts array T[] and key of type string, number or symbol as inputs.
 *
 *
 * @example
 *
 * const creatures = [{id: 1, type: 'cat'}, {id: 2, type: 'dog'}, {id: 3, type: 'parrot'}];
 *
 * const creaturesDictionary = toDictionary(creatures, 'id');
 *
 * // creaturesDictionary will be:
 * // {
 * //  1: {id: 1, type: 'cat'},
 * //  2: {id: 2, type: 'dog'},
 * //  3: {id: 3, type: 'parrot'}
 * // };
 * @see {@link OnlyKeysOfSpecificType}
 * @param {OnlyKeysOfSpecificType<T, S>} key
 * @returns { [key: string]: T[] }
 */
export function toDictionary<T extends object>(
  source: T[],
  key: OnlyKeysOfSpecificType<T, number> | OnlyKeysOfSpecificType<T, string> | OnlyKeysOfSpecificType<T, symbol>
): { [key: string]: T } {
  if (!isDefined(source)) {
    return source;
  }

  const sourceEmpty = !source.length;

  if (!Array.isArray(source) || sourceEmpty || !isKeyOf<T>(source[0][key])) {
    if (!sourceEmpty) {
      console.warn('ToDictionary: unexpected input params.');
    }
    return {};
  }

  const dictionary: { [key: string]: T } = {};
  const length = source.length;
  let i = 0;

  for (i; i < length; i++) {
    dictionary[`${source[i][key]}`] = Object.assign({}, source[i]);
  }

  return dictionary;
}
