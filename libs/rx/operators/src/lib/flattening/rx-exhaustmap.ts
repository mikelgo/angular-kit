import {catchError, exhaustMap, Observable, of, OperatorFunction} from "rxjs";
import {ProjectFn} from "./types";

/**
 * RxJs exhaustMap operator with error handling
 */
export function rxExhaustMap<T, R>(project: ProjectFn<T, R>): OperatorFunction<T, R> {
  return (source: Observable<T>) => source.pipe(
    exhaustMap((value, index) => project(value, index).pipe(
      catchError(error => of(error))
    )),
  );

}

