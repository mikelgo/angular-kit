import {Subject} from 'rxjs';
import {RxStatefulAccumulationFn} from "./accumulation-fn";
import {RefetchStrategy} from "../refetch-strategies/refetch-strategy";

/**
 * @publicApi
 *
 * @description
 * Context of the current emission.
 */
export type RxStatefulContext =  'suspense' | 'error' | 'next';



/**
 * @publicApi
 */
export interface RxStateful<T, E = unknown> {
  hasError: boolean;
  error: E | undefined;

  isSuspense: boolean;

  context: RxStatefulContext;

  value: T | null;
  hasValue: boolean;
}


export type RxStatefulWithError<T, E = unknown> = Pick<InternalRxState<T, E>,  'error' | 'context' | 'isLoading' | 'isRefreshing' | 'value' >;

/**
 * @internal
 */
export interface InternalRxState<T, E = unknown> {
  value: T | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: E | undefined;
  context: RxStatefulContext;
}

export interface RxStatefulSuspenseConfig{
  /**
   * Time in ms after which the suspense state is emitted.
   * For faster suspense times as the threshold no suspense state is emitted
   */
  thresholdMs: number;
  /**
   * Time in ms for which time interval the suspense state is valid before
   * the next value is emitted.
   */
  suspenseTimeMs: number;
}

/**
 * @publicApi
 *
 * @description
 * Configuration for rxStateful$
 *
 * @example
 * rxStateful$(source$, {keepValueOnRefresh: true})
 */
export interface RxStatefulConfig<T, E = unknown> {
  /**
   * Trigger to refresh the source$.
   * @deprecated use refetchStrategies instead
   * Will be removed in version 2 or 3.
   */
  refreshTrigger$?: Subject<any>;
  /**
   * One or multiple Trigger to refresh the source$.
   */
  refetchStrategies?: RefetchStrategy[] | RefetchStrategy
  /**
   * Define if the value should be kept on refresh or reset to null
   * @default false
   */
  keepValueOnRefresh?: boolean;
  /**
   * Accumulation function to accumulate the state.
   *
   * @default: ({ ...acc, ...val })
   */
  accumulationFn?: RxStatefulAccumulationFn<T, E>;
  /**
   * Define if the error should be kept on refresh or reset to null
   * @default false
   */
  keepErrorOnRefresh?: boolean;
  /**
   * Mapping function to map the error to a specific value.
   * @param error - the error which is thrown by the source$, e.g. a {@link HttpErrorResponse}.
   */
  errorMappingFn?: (error: E) => unknown;
  /**
   * Function which is called before the error is handled.
   * @param error - the error which is thrown by the source$, e.g. a {@link HttpErrorResponse}.
   */
  beforeHandleErrorFn?: (error: E) => void;
  /**
   *
   */
  suspenseConfig?: RxStatefulSuspenseConfig;
}


