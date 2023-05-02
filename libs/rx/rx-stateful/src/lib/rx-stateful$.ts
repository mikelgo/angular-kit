import {
  BehaviorSubject,
  catchError,
  debounce,
  distinctUntilChanged,
  map,
  merge,
  MonoTypeOperatorFunction,
  Observable,
  of,
  pipe,
  ReplaySubject,
  scan,
  share,
  skip,
  startWith,
  Subject,
  switchMap
} from "rxjs";


export type RxStatefulContext = 'idle' | 'suspense' | 'error' | 'next';

export interface RxStateful<T, E>{
  hasError$: Observable<boolean>;
  error$: Observable<E | never>;

  isSuspense$: Observable<boolean>;

  value$: Observable<T | null | undefined>;
  hasValue$: Observable<boolean>;

  //context$: Observable<RxStatefulContext>;
}


export interface InternalRxState<T, E> {
  value: T | null | undefined;
  isLoading: boolean;
  isRefreshing: boolean;
  error: E | undefined;
  context: RxStatefulContext;
}

export interface RxStatefulConfig {
  refreshTrigger$?: Subject<unknown>;
  keepValueOnRefresh?: boolean;
}


export function rxQuery$<T, E = unknown>(source$: Observable<T>): RxStateful<T, E>;
export function rxQuery$<T, E = unknown>(source$: Observable<T>, config: RxStatefulConfig): RxStateful<T, E>
export function rxQuery$<T, E = unknown>(source$: Observable<T>, config?: RxStatefulConfig): RxStateful<T, E> {

  const mergedConfig: RxStatefulConfig = {
    keepValueOnRefresh: true,
    ...config
  }

  const refreshTriggerIsBehaivorSubject = (config: RxStatefulConfig) => config.refreshTrigger$ instanceof BehaviorSubject;

  const refresh$ = mergedConfig?.refreshTrigger$ ?? new Subject<unknown>();
  const sharedSource$ = source$.pipe(
    share({
      connector: () => new ReplaySubject(1),
    }),
    catchError((error) => of({ error: error })),
  );

  const request$: Observable<Partial<InternalRxState<any, any>>> = sharedSource$.pipe(
    map((v) => ({ value: v, isLoading: false, isRefreshing: false })),
    startWith({ isLoading: true, isRefreshing: false })
  );


  const refreshedRequest$: Observable<Partial<InternalRxState<any, any>>> = refresh$.pipe(
    /**
     * in case the refreshTrigger$ is a BehaviorSubject, we want to skip the first value
     * bc otherwise the emissions are not correct. It will then emit 4 vales instead of 2.
     * the 2 additional values come from isRefreshing which is not correct.
     */
    refreshTriggerIsBehaivorSubject(mergedConfig) ? skip(1) : pipe(),
    switchMap(() =>
      sharedSource$.pipe(
        map((v) => ({ value: v, isLoading: false, isRefreshing: false })),
        mergedConfig?.keepValueOnRefresh ? startWith({ isLoading: true, isRefreshing: true }) :  startWith({ isLoading: true, isRefreshing: true,  value: null }),
      )
    )
  );

  const state$ = merge(request$, refreshedRequest$).pipe(
    scan(
      (acc, curr) => {
        return { ...acc, ...curr };
      },
      { isLoading: false, isRefreshing: false, value: undefined, error: undefined }
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

  return {
    value$: state$.pipe(map((state) => state.value)),
    hasValue$: state$.pipe(map((state) => !!state.value)),
    isSuspense$: state$.pipe(map((state) => state.isLoading || state.isRefreshing)),
    hasError$: state$.pipe(map((state) => !!state.error)),
    error$: state$.pipe(map((state) => state.error)),

  }
}
function _handleSyncValue<T>(): MonoTypeOperatorFunction<any> {
  return (source$: Observable<T>): Observable<T> => {
    return new Observable<T>((observer) => {
      const isReadySubject = new ReplaySubject<unknown>(1);

      const subscription = source$
        .pipe(
          /* Wait for all synchronous processing to be done. */
          debounce(() => isReadySubject)
        )
        .subscribe(observer);

      /* Sync emitted values have been processed now.
       * Mark source as ready and emit last computed state. */
      isReadySubject.next(undefined);

      return () => subscription.unsubscribe();
    });
  };
}
