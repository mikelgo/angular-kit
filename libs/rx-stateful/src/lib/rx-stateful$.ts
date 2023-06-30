import {
  BehaviorSubject,
  catchError,
  distinctUntilChanged,
  filter,
  map,
  merge,
  NEVER,
  Observable,
  pipe,
  ReplaySubject,
  scan,
  share,
  skip,
  startWith,
  Subject,
  switchMap,
} from 'rxjs';
import {Signal} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {
  InternalRxState,
  RxStateful,
  RxStatefulConfig,
  RxStatefulSignalConfig,
  RxStatefulSignals,
  RxStatefulWithError,
  Stateful,
} from './types/types';
import {_handleSyncValue} from './util/handle-sync-value';

/**
 * @publicApi
 */
export function rxStateful$<T, E = unknown>(source$: Observable<T>): RxStateful<T, E>;
export function rxStateful$<T, E = unknown>(source$: Observable<T>, config: RxStatefulConfig): RxStateful<T, E>;
export function rxStateful$<T, E = unknown>(
  source$: Observable<T>,
  config: RxStatefulSignalConfig
): RxStatefulSignals<T, E>;
export function rxStateful$<T, E = unknown>(
  source$: Observable<T>,
  config?: RxStatefulConfig | RxStatefulSignalConfig
): RxStateful<T, E> | RxStatefulSignals<T, E> {
  const error$$ = new Subject<RxStatefulWithError<T, E>>();

  const useSignals = (config as any)?.useSignals ?? false;
  const mergedConfig: RxStatefulConfig = {
    keepValueOnRefresh: true,
    ...config,
  };

  const refreshTriggerIsBehaivorSubject = (config: RxStatefulConfig) =>
    config.refreshTrigger$ instanceof BehaviorSubject;

  const refresh$ = mergedConfig?.refreshTrigger$ ?? new Subject<unknown>();
  const sharedSource$ = source$.pipe(
    share({
      connector: () => new ReplaySubject(1),
    }),
    catchError((error: any) => {
      error$$.next({ error: error?.message, context: 'error', hasError: true });
      return NEVER;
    })
  );

  const request$: Observable<Partial<InternalRxState<T, E>>> = sharedSource$.pipe(
    map(
      (v) =>
        ({ value: v, isLoading: false, isRefreshing: false, context: 'next', error: undefined } as Partial<
          InternalRxState<T, E>
        >)
    ),
    startWith({ isLoading: true, isRefreshing: false, context: 'suspense' } as Partial<InternalRxState<T, E>>)
  );

  const refreshedRequest$: Observable<Partial<InternalRxState<T, E>>> = refresh$.pipe(
    /**
     * in case the refreshTrigger$ is a BehaviorSubject, we want to skip the first value
     * bc otherwise the emissions are not correct. It will then emit 4 vales instead of 2.
     * the 2 additional values come from isRefreshing which is not correct.
     */
    // @ts-ignore todo
    refreshTriggerIsBehaivorSubject(mergedConfig) ? skip(1) : pipe(),
    switchMap(() =>
      sharedSource$.pipe(
        map(
          (v) =>
            ({ value: v, isLoading: false, isRefreshing: false, context: 'next', error: undefined } as Partial<
              InternalRxState<T, E>
            >)
        ),
        mergedConfig?.keepValueOnRefresh
          ? startWith({ isLoading: true, isRefreshing: true, context: 'suspense', error: undefined } as Partial<
              InternalRxState<T, E>
            >)
          : startWith({
              isLoading: true,
              isRefreshing: true,
              value: null,
              context: 'suspense',
              error: undefined,
            } as Partial<InternalRxState<T, E>>)
      )
    )
  );

  const state$ = merge(request$, refreshedRequest$, error$$).pipe(
    scan(
      // @ts-ignore
      (acc, curr) => {
        return { ...acc, ...curr };
      },
      { isLoading: false, isRefreshing: false, value: undefined, error: undefined, context: 'idle' }
    ),
    distinctUntilChanged(),
    share({
      connector: () => new ReplaySubject(1),
      resetOnError: false,
      resetOnComplete: false,
      resetOnRefCountZero: false,
    }),
    _handleSyncValue()
  );

  const rxStateful$ = {
    value$: state$.pipe(
      map((state, index) => {
        /**
         * todo there is for sure a nicer way to do this.
         *
         * IF we don't do this we will have two emissions when we refresh and keepValueOnRefresh = true.
         */
        if (index !== 0 && !mergedConfig.keepValueOnRefresh && (state.isLoading || state.isRefreshing)) {
          return null;
        }
        if (!state.isLoading || !state.isRefreshing) {
          return state.value;
        }
      }),
      filter((value) => value !== undefined)
    ),
    hasValue$: state$.pipe(map((state) => !!state.value)).pipe(distinctUntilChanged()),
    isSuspense$: state$.pipe(map((state) => state.isLoading || state.isRefreshing)).pipe(distinctUntilChanged()),
    hasError$: state$.pipe(map((state) => !!state.error)).pipe(distinctUntilChanged()),
    error$: state$.pipe(map((state) => state.error)),
    context$: state$.pipe(map((state) => state.context)),
    state$: state$.pipe(
      map((state) => ({
        value: state.value,
        hasValue: !!state.value,
        hasError: !!state.error,
        error: state.error,
        isSuspense: state.isLoading || state.isRefreshing,
        context: state.context,
      })),
      distinctUntilChanged()
    ),
  };

  if (useSignals) {
    return {
      value: toSignal(rxStateful$.value$),
      hasValue: toSignal(rxStateful$.hasValue$) as Signal<boolean>,
      isSuspense: toSignal(rxStateful$.isSuspense$),
      hasError: toSignal(rxStateful$.hasError$) as Signal<boolean>,
      error: toSignal(rxStateful$.error$),
      context: toSignal(rxStateful$.context$),
      state: toSignal(rxStateful$.state$) as Signal<Stateful<T, E>>,
    };
  } else {
    return rxStateful$;
  }
}
