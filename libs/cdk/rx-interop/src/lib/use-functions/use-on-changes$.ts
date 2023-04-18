import {distinctUntilChanged, filter, Observable, ReplaySubject} from "rxjs";
import {OnChanges, SimpleChanges} from "@angular/core";
import {TypedSimpleChanges} from "../on-changes/effect-on-changes$";
import {mapChanges} from "../on-changes/util/map-changes";


/**
 *  @publicApi
 *  @description
 *  Creates a stream on {@link OnChanges} of a component.
 *
 * @param component
 * @param input
 */
export function useOnChanges$<I extends Record<string, any>,C extends OnChanges, K extends keyof C>(component: C, ...input: Array<K>): Observable<Partial<I>> {
  const {stream$} = decorate<I, C>(component);

  return stream$.asObservable().pipe(
    filter(isNotUndefined),
    distinctUntilChanged((previous: Partial<I>, current: Partial<I>) => {
      const keys = Object.keys(current);
      return keys.every((key) => {
        return current[key] === previous[key];
      });
    })
  );
}


/**
 * @internal
 * @param originalNgOnChanges
 */
export function validate(originalNgOnChanges: (changes: SimpleChanges) => void) {
  if (!originalNgOnChanges) {
    throw new Error('ngOnChanges is not defined. Did you forget to implement OnChanges interface?');
  }
}

/**
 * @internal
 * @param component
 */
export function decorate<I extends Record<string, any>,C extends OnChanges>(component: C) {
  const originalNgOnChanges = component.ngOnChanges;

  validate(originalNgOnChanges);

  const {wrapper, stream$} = createWrapper<I,C>(component);

  component.ngOnChanges = wrapper;

  return {stream$}
}


/**
 * @internal
 * @param component
 */
function createWrapper<I extends Record<string, any>,C extends OnChanges>(component: C){
  const originalNgOnChanges = component.ngOnChanges;
  const stream$ = new ReplaySubject<Partial<I>>()
  const wrapper = (changes: TypedSimpleChanges<I>) => {
    const mappedChanges: Partial<I> = mapChanges(changes);
    if (mappedChanges === undefined) {
      return;
    }
    stream$.next(mappedChanges);

    originalNgOnChanges(changes);
  }

  return {wrapper, stream$};
}

/**
 * @internal
 * @param value
 */
export function isNotUndefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}
