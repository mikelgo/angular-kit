import {isObservable, Observable, of} from 'rxjs';

/**
 * Coerces a value to an observable.
 */
export function coerceObservable<T = unknown>(potentialObservable: T | Observable<T>): Observable<T> {
  return isObservable(potentialObservable) ? potentialObservable : of(potentialObservable);
}
