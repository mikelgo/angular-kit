import { distinctUntilChanged, Observable, OperatorFunction } from 'rxjs';

export type ComparatorFn<T> = (previous: T, current: T) => boolean;

const defaultComparatorFn = <T>(a: T, b: T) => JSON.stringify(a) === JSON.stringify(b);

export function rxDistinctUntilChanged<T>(comparatorFn?: ComparatorFn<T>): OperatorFunction<T, T> {
  return (source: Observable<T>) => source.pipe(distinctUntilChanged(comparatorFn ?? defaultComparatorFn));
}
