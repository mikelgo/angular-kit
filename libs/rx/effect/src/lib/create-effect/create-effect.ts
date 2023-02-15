import { concatMap, Observable, Subject } from 'rxjs';

/**
 * Creates an effect from {@param effectSource }that emits when the {@param effectTrigger} is emitted.
 * @param effectSource
 * @param effectTrigger
 */

export function createEffect<T>(effectSource: () => Observable<T>, effectTrigger: Subject<any>): Observable<T>;
export function createEffect<T, Targ>(
  effectSource: (arg: Targ) => Observable<T>,
  effectTrigger: Subject<any>
): Observable<T>;
export function createEffect<T, Targ>(
  effectSource: (arg?: Targ) => Observable<T>,
  effectTrigger: Subject<any>
): Observable<T> {
  return effectTrigger.asObservable().pipe(concatMap((arg: Targ) => effectSource(arg)));
}
