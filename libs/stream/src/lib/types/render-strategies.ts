
export interface RenderStrategy {
  type: 'default' | 'viewport' | 'throttle' | 'debounce';
}

/**
 * @publicApi
 *
 * @description
 * Default render strategy
 */
export interface DefaultRenderStategy extends RenderStrategy {
  type: 'default';
}

/**
 * @publicApi
 *
 * @description
 * Viewport render strategy which configures to trigger change detection
 * only when the element is in the viewport.
 */
export interface ViewportRenderStrategy extends RenderStrategy {
  type: 'viewport';
  root?: HTMLElement
  rootMargin?: string;
  threshold?: number | number[];
}

/**
 * @publicApi
 *
 * @description
 * Throttle render strategy which will throttle down trigger change detection.
 *
 */
export interface ThrottleRenderStrategy extends RenderStrategy {
  type: 'throttle';
  throttleInMs: number;
}

/**
 * @publicApi
 *
 * @description
 * Debounce render strategy which will debounce to trigger change detection.
 */
export interface DebounceRenderStrategy extends RenderStrategy {
  type: 'debounce';
  debounceInMs: number;
}

export type RenderStrategies = DefaultRenderStategy | ViewportRenderStrategy | ThrottleRenderStrategy;

/**
 * @description
 * Checks if the strategy is a {@link DefaultRenderStategy}.
 * @param strategy
 */
export function isDefaultRenderStrategy(strategy: RenderStrategy): strategy is DefaultRenderStategy {
  return strategy.type === 'default';
}

/**
 * @description
 * Checks if the strategy is a {@link ViewportRenderStrategy}.
 * @param strategy
 */
export function isViewportRenderStrategy(strategy: RenderStrategy): strategy is ViewportRenderStrategy {
  return strategy.type === 'viewport';
}

/**
 * @description
 * Checks if the strategy is a {@link ThrottleRenderStrategy}.
 * @param strategy
 */
export function isThrottleRenderStrategy(strategy: RenderStrategy): strategy is ThrottleRenderStrategy {
  return strategy.type === 'throttle';
}

/**
 * @description
 * Checks if the strategy is a {@link DebounceRenderStrategy}.
 * @param strategy
 */
export function isDebounceRenderStrategy(strategy: RenderStrategy): strategy is DebounceRenderStrategy {
  return strategy.type === 'debounce';
}
