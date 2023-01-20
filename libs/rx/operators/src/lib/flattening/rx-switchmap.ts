import {catchError, Observable, of, OperatorFunction, switchMap} from "rxjs";

/**
 * RxJs switchMap operator with error handling
 */
export function rxSwitchMap<T, R>(project: (value: T, index: number) => Observable<R>): OperatorFunction<T, R> {
  return (source: Observable<T>) => source.pipe(
    switchMap((value, index) => project(value, index).pipe(
      catchError(error => of(error))
    )),
  );

}

