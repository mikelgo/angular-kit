import {debounceTime, distinctUntilChanged, filter, map, mergeAll, Observable, of, pipe, throttleTime,} from 'rxjs';
import {
  isDebounceRenderStrategy,
  isThrottleRenderStrategy,
  isViewportRenderStrategy,
  RenderStrategies,
} from '../types/render-strategies';

/**
 * @internal
 * @description
 * Derive the operator for the render strategy.
 */
export function setupOperator$(renderStrategy$$: Observable<RenderStrategies>) {
  return renderStrategy$$.pipe(
    distinctUntilChanged(),
    filter((strategy) => !isViewportRenderStrategy(strategy)),
    map((strategy) => {
      if (isThrottleRenderStrategy(strategy)) {
        return of(throttleTime(strategy.throttleInMs));
      }

      if (isDebounceRenderStrategy(strategy)) {
        return of(debounceTime(strategy.debounceInMs));
      }

      return of(pipe());
    }),
    mergeAll()
  );
}
