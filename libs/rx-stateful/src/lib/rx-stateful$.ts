import {
  BehaviorSubject,
  catchError,
  distinctUntilChanged,
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
import {
  InternalRxState,
  RxStateful,
  RxStatefulConfig,
  RxStatefulSignalConfig,
  RxStatefulSignals,
  RxStatefulWithError,
} from './types/types';
import {_handleSyncValue} from './util/handle-sync-value';
import {createRxStateful} from './util/create-rx-stateful';
import {createRxStatefulSignals} from './util/create-rx-stateful-signals';
import {isRxStatefulSignalConfigGuard} from './types/guards';
import {defaultAccumulationFn} from './types/accumulation-fn';

/**
 * @publicApi
 */
export function rxStateful$<T, E = unknown>(source$: Observable<T>): RxStateful<T, E>;
export function rxStateful$<T, E = unknown>(source$: Observable<T>, config: RxStatefulConfig<T, E>): RxStateful<T, E>;
export function rxStateful$<T, E = unknown>(
  source$: Observable<T>,
  config: RxStatefulSignalConfig<T, E>
): RxStatefulSignals<T, E>;
export function rxStateful$<T, E = unknown>(
  source$: Observable<T>,
  config?: RxStatefulConfig<T, E> | RxStatefulSignalConfig<T, E>
): RxStateful<T, E> | RxStatefulSignals<T, E> {
  const useSignals = isRxStatefulSignalConfigGuard(config) ?? false;
  const mergedConfig: RxStatefulConfig<T, E> = {
    keepValueOnRefresh: true,
    ...config,
  };
  const accumulationFn = mergedConfig.accumulationFn ?? defaultAccumulationFn;
  const error$$ = new Subject<RxStatefulWithError<T, E>>();
  const refresh$ = mergedConfig?.refreshTrigger$ ?? new Subject<unknown>();

  const { request$, refreshedRequest$ } = initSources(source$, error$$, refresh$, mergedConfig);

  const state$ = merge(request$, refreshedRequest$, error$$).pipe(
    scan(accumulationFn, {
      isLoading: false,
      isRefreshing: false,
      value: undefined,
      error: undefined,
      context: 'idle',
    }),
    distinctUntilChanged(),
    share({
      connector: () => new ReplaySubject(1),
      resetOnError: false,
      resetOnComplete: false,
      resetOnRefCountZero: false,
    }),
    _handleSyncValue()
  );

  const rxStateful$ = createRxStateful<T, E>(state$, mergedConfig);

  if (useSignals) {
    return createRxStatefulSignals<T, E>(rxStateful$);
  } else {
    return rxStateful$;
  }
}

function initSource<T, E>(source$: Observable<T>, error$$: Subject<RxStatefulWithError<T, E>>): Observable<T> {
  return source$.pipe(
    share({
      connector: () => new ReplaySubject(1),
    }),
    catchError((error: any) => {
      error$$.next({ error: error?.message, context: 'error', hasError: true });
      return NEVER;
    })
  );
}

function requestSource<T, E>(source$: Observable<T>): Observable<Partial<InternalRxState<T, E>>> {
  return source$.pipe(
    map(
      (v) =>
        ({ value: v, isLoading: false, isRefreshing: false, context: 'next', error: undefined } as Partial<
          InternalRxState<T, E>
        >)
    ),
    startWith({ isLoading: true, isRefreshing: false, context: 'suspense' } as Partial<InternalRxState<T, E>>)
  );
}

function refreshedRequestSource<T, E>(
  sharedSource$: Observable<T>,
  refresh$: Subject<any>,
  mergedConfig: RxStatefulConfig<T, E>
): Observable<Partial<InternalRxState<T, E>>> {
  const refreshTriggerIsBehaivorSubject = (config: RxStatefulConfig<T, E>) =>
    config.refreshTrigger$ instanceof BehaviorSubject;
  return refresh$.pipe(
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
}

function initSources<T, E>(
  source$: Observable<T>,
  error$$: Subject<RxStatefulWithError<T, E>>,
  refresh$: Subject<any>,
  mergedConfig: RxStatefulConfig<T, E>
) {
  const sharedSource$ = initSource<T, E>(source$, error$$);

  const request$ = requestSource<T, E>(sharedSource$);

  const refreshedRequest$ = refreshedRequestSource<T, E>(sharedSource$, refresh$, mergedConfig);

  return { request$, refreshedRequest$ };
}
