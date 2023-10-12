import {
  BehaviorSubject,
  catchError,
  combineLatest,
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
  takeUntil,
  tap,
  timer,
} from 'rxjs';
import {InternalRxState, RxStateful, RxStatefulConfig, RxStatefulWithError} from './types/types';
import {_handleSyncValue} from './util/handle-sync-value';
import {defaultAccumulationFn} from './types/accumulation-fn';
import {createRxStateful} from './util/create-rx-stateful';
import {mergeRefetchStrategies} from './refetch-strategies/merge-refetch-strategies';

/**
 * @publicApi
 *
 * @description
 * Creates a new rxStateful$ instance.
 *
 * rxStateful$ will enhance the source$ with additional information about the current state of the source$, like
 * e.g. if it is in a suspense or error state.
 *
 * @example
 * const source$ = httpClient.get('https://my-api.com');
 * const rxStateful$ = rxStateful$(source$);
 *
 * @param source$ - The source$ to enhance with additional state information.
 */
export function rxStateful$<T, E = unknown>(source$: Observable<T>): RxStateful<T, E>;
/**
 * @publicApi
 *
 * @example
 * const source$ = httpClient.get('https://my-api.com');
 * const rxStateful$ = rxStateful$(source$, { keepValueOnRefresh: true });
 *
 * @param source$ - The source$ to enhance with additional state information.
 * @param config - Configuration for rxStateful$.
 */
export function rxStateful$<T, E = unknown>(source$: Observable<T>, config: RxStatefulConfig<T, E>): RxStateful<T, E>;
export function rxStateful$<T, E = unknown>(source$: Observable<T>, config?: RxStatefulConfig<T, E>): RxStateful<T, E> {
  // todo Angular 16
  // const injector = config?.injector ?? inject(Injector);
  // todo Angular-16 runInInjectionContext(injector)

  const mergedConfig: RxStatefulConfig<T, E> = {
    keepValueOnRefresh: false,
    keepErrorOnRefresh: false,
    ...config,
  };

  return createRxStateful<T, E>(createState$<T, E>(source$, mergedConfig), mergedConfig);
}

function createState$<T, E>(source$: Observable<T>, mergedConfig: RxStatefulConfig<T, E>) {
  const accumulationFn = mergedConfig.accumulationFn ?? defaultAccumulationFn;
  const error$$ = new Subject<RxStatefulWithError<T, E>>();
  const refresh$ = merge(
    mergedConfig?.refreshTrigger$ ?? new Subject<unknown>(),
    ...mergeRefetchStrategies(mergedConfig?.refetchStrategies)
  );

  const sharedSource$ = initSharedSource(source$, error$$, mergedConfig);
  const request$: Observable<Partial<InternalRxState<T, E>>> = requestSource(sharedSource$);
  const refreshedRequest$: Observable<Partial<InternalRxState<T, E>>> = refreshedRequestSource(
    sharedSource$,
    refresh$,
    mergedConfig
  );

  /**
   * Das klappt so nicht. Da ich request und refreshedRequest habe ist es ein wenig komplizierter
   * muss schauen wie ich das am besten mache
   */
  const suspenseState$ = deriveSuspenseState<T,E>(merge (request$)).pipe(
      distinctUntilChanged()
  )

  // todo hier muss ich was drehen damit das auch für refresh passt
  // hat glaub auch keinen effekt bisher
  const refreshedRequestSuspenseState$ = deriveSuspenseState<T,E>(merge (refreshedRequest$)).pipe(
    distinctUntilChanged(),
  )

  const suspense$ = merge(suspenseState$, refreshedRequestSuspenseState$).pipe(
    distinctUntilChanged((a,b) => a.context === b.context)
  )

  return merge(request$, refreshedRequest$, error$$,suspense$ ).pipe(
    /**
     * todo
     * this is a bit hacky as value can not be undefined (it is typed
     * as T | null). However when I change to null some side effets happen.
     * Need investigation!!!
     */
    // @ts-ignore
    scan(accumulationFn, {

    }),
    distinctUntilChanged(),
    share({
      connector: () => new ReplaySubject(1),
      resetOnError: false,
      resetOnComplete: true,
      resetOnRefCountZero: true,
    }),
    _handleSyncValue()
  );
}

function initSharedSource<T, E>(
  source$: Observable<T>,
  error$$: Subject<RxStatefulWithError<T, E>>,
  mergedConfig: RxStatefulConfig<T, E>
): Observable<T> {
  return source$.pipe(
    share({
      connector: () => new ReplaySubject(1),
      resetOnError: true,
      resetOnComplete: true,
      resetOnRefCountZero: true,
    }),
    catchError((error: E) => {
      mergedConfig?.beforeHandleErrorFn?.(error);
      const errorMappingFn = mergedConfig.errorMappingFn ?? ((error: E) => (error as any)?.message);
      error$$.next({
        error: errorMappingFn(error),
        context: 'error',
        isLoading: false,
        isRefreshing: false,
        value: null,
      });
      return NEVER;
    })
  );
}

function requestSource<T, E>(source$: Observable<T>): Observable<Partial<InternalRxState<T, E>>> {
  return source$.pipe(
    map(
      (v) =>
        ({ value: v, error: undefined } as Partial<
          InternalRxState<T, E>
        >)
    ),
    //startWith({ isLoading: true, isRefreshing: false, context: 'suspense' } as Partial<InternalRxState<T, E>>)
  );
}

function refreshedRequestSource<T, E>(
  sharedSource$: Observable<T>,
  refresh$: Observable<any>,
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
            ({ value: v, error: undefined } as Partial<
              InternalRxState<T, E>
            >)
        ),
        deriveInitialValue<T, E>(mergedConfig)
      )
    )
  ) as Observable<Partial<InternalRxState<T, E>>>;
}

function deriveInitialValue<T, E>(mergedConfig: RxStatefulConfig<T, E>) {
  let value: Partial<InternalRxState<T, E>> = {
    //isLoading: true,
    //isRefreshing: true,
    //context: 'suspense',
  };
  if (!mergedConfig.keepValueOnRefresh) {
    value = {
      ...value,
      value: null,
    };
  }
  if (!mergedConfig.keepErrorOnRefresh) {
    value = {
      ...value,
      error: undefined,
    };
  }

  return startWith(value);
}

export function deriveSuspenseState<T, E>(
  source$: Observable<any>,
  suspenseThreshold: number = 500,
  suspenseTime: number = 2000
) {
    // --> this is sharedSource$
  const result$ = source$.pipe(share(), tap(x => console.log('result$', x)))

  const showLoadingIndicator$ = merge(
    // ON after suspenseThreshold
    timer(suspenseThreshold).pipe(
      map(() => ({ isLoading: true, isRefreshing: true, context: 'suspense' })),
      takeUntil(result$),
    ),

    // OFF once we receive a result, yet at least in 2s
    combineLatest([result$, timer(suspenseThreshold + suspenseTime)]).pipe(
      map(() => ({ isLoading: false, isRefreshing: false, context: 'next' }))
    )
  ).pipe(
    startWith({ isLoading: false, isRefreshing: false, context: 'next' }),
    distinctUntilChanged((previous, current) => previous.context === current.context),
  );

  return showLoadingIndicator$;
}

/**
 *
 * ## expose loading
 * ```ts
 *
 * { "hasValue": false, "hasError": false, "isSuspense": true, "context": "suspense" } }
 * { "value": "delectus aut autem", "hasValue": true, "hasError": false, "isSuspense": false, "context": "next" }
 *
 * ---
 *  { "value": null, "hasValue": false, "hasError": false, "isSuspense": true, "context": "suspense" }
 *  { "value": "delectus aut autem", "hasValue": true, "hasError": false, "isSuspense": false, "context": "next" }
 * ```
 *
 * ## dont expose loading because its fast
 * ```ts
 *
 *
 * { "value": "delectus aut autem", "hasValue": true, "hasError": false, "isSuspense": false, "context": "next" }
 *
 * ---
 *
 *  { "value": "delectus aut autem", "hasValue": true, "hasError": false, "isSuspense": false, "context": "next" }
 * ```
 */
