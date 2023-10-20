/**
 * @description
 * Context for the *stream-directive.
 */
export interface StreamDirectiveContext<T> {
  $implicit: T ;
  stream: T ;
  error: any;
  completed: boolean;
  loading: boolean;

  renderCount: number;
}
