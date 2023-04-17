/**
 * @description
 * Context for the *stream-directive.
 */
export interface StreamDirectiveContext<T = any> {
  $implicit: T | null;
  stream: T | null;
  error: any;
  completed: boolean;
  loading: boolean;

  renderCount: number;
}
