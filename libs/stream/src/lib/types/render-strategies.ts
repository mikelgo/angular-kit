export interface RenderStrategy {
  type: 'default' | 'viewport' | 'throttle' | 'debounce';
}

export interface DefaultRenderStategy extends RenderStrategy {
  type: 'default';
}

export interface ViewportRenderStrategy extends RenderStrategy {
  type: 'viewport';
  rootMargin?: string;
  threshold?: number | number[];
}

export interface ThrottleRenderStrategy extends RenderStrategy {
  type: 'throttle';
  throttleInMs: number;
}

export interface DebounceRenderStrategy extends RenderStrategy {
  type: 'debounce';
  debounceInMs: number;
}

export type RenderStrategies = DefaultRenderStategy | ViewportRenderStrategy | ThrottleRenderStrategy;

export function isDefaultRenderStrategy(strategy: RenderStrategy): strategy is DefaultRenderStategy {
  return strategy.type === 'default';
}

export function isViewportRenderStrategy(strategy: RenderStrategy): strategy is ViewportRenderStrategy {
  return strategy.type === 'viewport';
}

export function isThrottleRenderStrategy(strategy: RenderStrategy): strategy is ThrottleRenderStrategy {
  return strategy.type === 'throttle';
}

export function isDebounceRenderStrategy(strategy: RenderStrategy): strategy is DebounceRenderStrategy {
  return strategy.type === 'debounce';
}
