/**
 * @description
 * A render context is a container for the value, error and render cycle of streams
 * handled by *stream-directive.
 *
 * @publicApi
 */
export interface RenderContext<T> {
  value: T | null;
  error: any;
  renderCycle: 'before-next' | 'next' | 'error' | 'complete';
}
