import { filter, OperatorFunction } from 'rxjs';

function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined && value !== null;
}

/**
 * Filters out null and undefined values.
 */
export function filterForValue<T>(): OperatorFunction<T, T> {
  return filter(isDefined);
}
