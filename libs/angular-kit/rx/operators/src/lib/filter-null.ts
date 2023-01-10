import { filter, OperatorFunction } from 'rxjs';

function isNotNull<T>(value: T | undefined): value is T {
  return value !== null;
}

/**
 * Filters out null values.
 */
export function filterNull<T>(): OperatorFunction<T, T> {
  return filter(isNotNull);
}
