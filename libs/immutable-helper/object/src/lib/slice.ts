import { isDefined, isKeyOf, isObjectGuard } from './_internals/guards';

/**
 * @description
 * Accepts an object of type T and single key or array of keys (K extends keyof T).
 * Constructs new object based on provided keys.
 *
 * @example
 *
 * const cat = {id: 1, type: 'cat', name: 'Fluffy'};
 *
 * const catWithoutType = slice(cat, ['name', 'id']);
 *
 * // catWithoutType will be:
 * // {id: 1, name: 'Fluffy'};
 * @returns T
 *
 */
export function slice<T extends object, K extends keyof T>(object: T, keys: K | K[]): Pick<T, K> {
  const objectIsObject = isDefined(object) && isObjectGuard(object);

  if (!objectIsObject) {
    console.warn(`slice: original value (${object}) is not an object.`);
    return undefined as any;
  }

  const sanitizedKeys = (Array.isArray(keys) ? keys : [keys]).filter((k) => isKeyOf<T>(k) && k in object);

  if (!sanitizedKeys.length) {
    console.warn(`slice: provided keys not found`);
    return undefined as any;
  }

  return sanitizedKeys.reduce((acc, k) => ({ ...acc, [k]: object[k] }), {} as Pick<T, K>);
}
