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
import {createRxStateful} from "./util/create-rx-stateful";
import {createRxStatefulSignals} from "./util/create-rx-stateful-signals";

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

  const rxStateful$ = createRxStateful<T,E>(state$, mergedConfig);

  if (useSignals) {
    return createRxStatefulSignals<T, E>(rxStateful$);
  } else {
    return rxStateful$;
  }
}
