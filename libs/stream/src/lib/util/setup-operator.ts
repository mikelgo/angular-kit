import {
  BehaviorSubject,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  mergeAll,
  Observable,
  of,
  pipe,
  throttleTime,
} from 'rxjs';
import {
  isDebounceRenderStrategy,
  isThrottleRenderStrategy,
  isViewportRenderStrategy,
  RenderStrategies,
} from '../types/render-strategies';

/**
 * @internal
 */
export function setupOperator$(renderStrategy$$: BehaviorSubject<Observable<RenderStrategies>>) {
  return renderStrategy$$.pipe(
    mergeAll(),
    distinctUntilChanged(),
    filter((strategy) => !isViewportRenderStrategy(strategy)),
    map((strategy) => {
      if (isThrottleRenderStrategy(strategy)) {
        return of(throttleTime(strategy.throttleInMs));
      }

      if (isDebounceRenderStrategy(strategy)) {
        // @ts-ignore todo fix typing issue
        return of(debounceTime(strategy.debounceInMs));
      }

      return of(pipe());
    }),
    mergeAll()
  );
}
