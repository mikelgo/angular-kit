import {catchError, mergeMap, Observable, of, OperatorFunction} from "rxjs";

/**
 * RxJs mergeMap operator with error handling
 */
export function rxMergeMap<T, R>(project: (value: T, index: number) => Observable<R>): OperatorFunction<T, R> {
  return (source: Observable<T>) => source.pipe(
    mergeMap((value, index) => project(value, index).pipe(
      catchError(error => of(error))
    )),
  );

}

