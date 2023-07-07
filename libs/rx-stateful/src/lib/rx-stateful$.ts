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
import {InternalRxState, RxStateful, RxStatefulConfig, RxStatefulWithError,} from './types/types';
import {_handleSyncValue} from './util/handle-sync-value';
import {defaultAccumulationFn} from "./types/accumulation-fn";
import {createRxStateful} from "./util/create-rx-stateful";

/**
 * @publicApi
 */
export function rxStateful$<T, E = unknown>(source$: Observable<T>): RxStateful<T, E>;
export function rxStateful$<T, E = unknown>(source$: Observable<T>, config: RxStatefulConfig<T,E>): RxStateful<T, E>;
export function rxStateful$<T, E = unknown>(
  source$: Observable<T>,
  config?: RxStatefulConfig<T,E>
): RxStateful<T, E> {
  const mergedConfig: RxStatefulConfig<T,E> = {
    keepValueOnRefresh: false,
    keepErrorOnRefresh: false,
    ...config,
  };

  const rxStateful$ = createRxStateful<T, E>(createState$<T,E>(source$, mergedConfig), mergedConfig);

  return rxStateful$;
}

function createState$<T,E>(source$: Observable<T>, mergedConfig: RxStatefulConfig<T,E>){
  const accumulationFn = mergedConfig.accumulationFn ?? defaultAccumulationFn;
  const error$$ = new Subject<RxStatefulWithError<T, E>>();
  const refresh$ = mergedConfig?.refreshTrigger$ ?? new Subject<unknown>();
  const { request$, refreshedRequest$ } = initSources(source$, error$$, refresh$, mergedConfig);

  return merge(request$, refreshedRequest$, error$$).pipe(
    scan(
      accumulationFn,
      { isLoading: false, isRefreshing: false, value: undefined, error: undefined, context: 'suspense' }
    ),
    distinctUntilChanged(),
    share({
      connector: () => new ReplaySubject(1),
      resetOnError: false,
      resetOnComplete: false,
      resetOnRefCountZero: true,
    }),
    _handleSyncValue()
  );
}

function initSource<T, E>(source$: Observable<T>, error$$: Subject<RxStatefulWithError<T, E>>, mergedConfig: RxStatefulConfig<T, E>): Observable<T> {
  return source$.pipe(
    share({
      connector: () => new ReplaySubject(1),
    }),
    catchError((error: E) => {
      const errorMappingFn = mergedConfig.errorMappingFn ?? ((error: E ) => (error as any)?.message);
      error$$.next({ error: errorMappingFn(error), context: 'error', hasError: true });
      return NEVER;
    })
  );
}

function initSources<T, E>(
  source$: Observable<T>,
  error$$: Subject<RxStatefulWithError<T, E>>,
  refresh$: Subject<any>,
  mergedConfig: RxStatefulConfig<T, E>
) {
  const sharedSource$ = initSource<T, E>(source$, error$$, mergedConfig);

  const request$ = requestSource<T, E>(sharedSource$);

  const refreshedRequest$ = refreshedRequestSource<T, E>(sharedSource$, refresh$, mergedConfig);

  return { request$, refreshedRequest$ };
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


