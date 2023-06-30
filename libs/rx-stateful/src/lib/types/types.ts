import {Observable, Subject} from 'rxjs';

/**
 * @publicApi
 */
export type RxStatefulContext = 'idle' | 'suspense' | 'error' | 'next';

/**
 * @publicApi
 */
export interface Stateful<T, E> {
  hasError: boolean;
  error: E | undefined;

  isSuspense: boolean;

  context: RxStatefulContext;

  value: T | null | undefined;
  hasValue: boolean;
}

/**
 * @publicApi
 */
export interface RxStateful<T, E> {
  hasError$: Observable<boolean>;
  error$: Observable<E | never>;

  isSuspense$: Observable<boolean>;

  value$: Observable<T | null | undefined>;
  hasValue$: Observable<boolean>;

  context$: Observable<RxStatefulContext>;

  state$: Observable<Stateful<T, E>>;
}

export type RxStatefulWithError<T, E> = Pick<Stateful<T, E>, 'hasError' | 'error' | 'context'>;

/**
 * @internal
 */
export interface InternalRxState<T, E> {
  value: T | null | undefined;
  isLoading: boolean;
  isRefreshing: boolean;
  error: E | undefined;
  context: RxStatefulContext;
}

/**
 * @publicApi
 */
export interface RxStatefulConfig {
  refreshTrigger$?: Subject<any>;
  keepValueOnRefresh?: boolean;
}
