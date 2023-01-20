import {catchError, Observable, of, OperatorFunction, switchMap} from "rxjs";
import {ProjectFn} from "./types";

/**
 * RxJs switchMap operator with error handling
 */
export function rxSwitchMap<T, R>(project: ProjectFn<T, R>): OperatorFunction<T, R> {
  return (source: Observable<T>) => source.pipe(
    switchMap((value, index) => project(value, index).pipe(
      catchError(error => of(error))
    )),
  );

}

