/**
 * @description
 * Context for the *stream-directive.
 */
export interface StreamDirectiveContext<T> {
  $implicit: T | null;
  stream: T | null;
  error: any;
  completed: boolean;
  loading: boolean;

  renderCount: number;
}
