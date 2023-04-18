import {OnChanges} from "@angular/core";
import {distinctUntilChanged, filter, Observable, scan} from "rxjs";
import {decorate, isNotUndefined} from "./use-on-changes$";

/**
 *  @publicApi
 *  @description
 *  Creates a stream on accumulated {@link OnChanges} of a component.
 *
 * @param component
 * @param input
 */
export function useOnChangesState$<I extends Record<string, any>,C extends OnChanges, K extends keyof C>(component: C, ...input: Array<K>): Observable<I> {
  const {stream$} = decorate<I, C>(component);

  return stream$.asObservable().pipe(
    filter(isNotUndefined),
    scan((acc, curr) => ({...acc, ...curr}), {} as I),
    distinctUntilChanged((previous: I, current: I) => {
      const keys = Object.keys(current);
      return keys.every((key) => {
        return current[key] === previous[key];
      });
    })
  );
}
