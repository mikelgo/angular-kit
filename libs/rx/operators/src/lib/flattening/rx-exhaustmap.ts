import {catchError, exhaustMap, Observable, of, OperatorFunction} from "rxjs";

/**
 * RxJs exhaustMap operator with error handling
 */
export function rxExhaustMap<T, R>(project: (value: T, index: number) => Observable<R>): OperatorFunction<T, R> {
  return (source: Observable<T>) => source.pipe(
    exhaustMap((value, index) => project(value, index).pipe(
      catchError(error => of(error))
    )),
  );

}

