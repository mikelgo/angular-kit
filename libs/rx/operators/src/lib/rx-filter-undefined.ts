import {filter, OperatorFunction} from 'rxjs';

function isNotUndefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}

/**
 * Filters out undefined values.
 */
export function rxFilterUndefined<T>(): OperatorFunction<T, T> {
  return filter(isNotUndefined);
}
