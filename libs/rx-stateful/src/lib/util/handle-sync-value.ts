import {debounce, MonoTypeOperatorFunction, Observable, ReplaySubject} from "rxjs";

/**
 * @internal
 * Shamelessly copied from https://github.com/jscutlery/devkit/blob/main/packages/operators/src/lib/suspensify.ts#L108
 */
export function _handleSyncValue<T>(): MonoTypeOperatorFunction<any> {
  return (source$: Observable<T>): Observable<T> => {
    return new Observable<T>((observer) => {
      const isReadySubject = new ReplaySubject<unknown>(1);

      const subscription = source$
        .pipe(
          /* Wait for all synchronous processing to be done. */
          debounce(() => isReadySubject)
        )
        .subscribe(observer);

      /* Sync emitted values have been processed now.
       * Mark source as ready and emit last computed state. */
      isReadySubject.next(undefined);

      return () => subscription.unsubscribe();
    });
  };
}
