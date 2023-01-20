import {catchError, concatMap, Observable, of, OperatorFunction} from "rxjs";
import {ProjectFn} from "./types";

/**
 * RxJs concatMap operator with error handling
 */
export function rxConcatmap<T, R>(project: ProjectFn<T, R>): OperatorFunction<T, R> {
  return (source: Observable<T>) => source.pipe(
    concatMap((value, index) => project(value, index).pipe(
      catchError(error => of(error))
    )),
  );

}

