import {catchError, concatMap, Observable, of, OperatorFunction} from "rxjs";

/**
 * RxJs concatMap operator with error handling
 */
export function rxConcatmap<T, R>(project: (value: T, index: number) => Observable<R>): OperatorFunction<T, R> {
  return (source: Observable<T>) => source.pipe(
    concatMap((value, index) => project(value, index).pipe(
      catchError(error => of(error))
    )),
  );

}

