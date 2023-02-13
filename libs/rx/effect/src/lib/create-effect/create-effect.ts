import {concatMap, Observable, Subject} from "rxjs";

/**
 * Creates an effect from {@param effectSource }that emits when the {@param effectTrigger} is emitted.
 * @param effectSource
 * @param effectTrigger
 */
export function createEffect<T>(effectSource: () => Observable<T>, effectTrigger: Subject<unknown>): Observable<T> {
  return effectTrigger.asObservable().pipe(
    concatMap(() => effectSource())
  )
}
