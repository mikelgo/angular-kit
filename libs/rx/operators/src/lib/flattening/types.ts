import {Observable} from "rxjs";

/**
 * Projection function for higher order operators
 * like rxSwitchMap, rxMergeMap, rxConcatMap, rxExhaustMap
 */
export type ProjectFn<T, R> = (value: T, index: number) => Observable<R>;
