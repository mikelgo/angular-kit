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
import {InternalRxState, RxStateful, RxStatefulConfig, RxStatefulWithError,} from './types/types';
import {_handleSyncValue} from './util/handle-sync-value';
import {defaultAccumulationFn} from "./types/accumulation-fn";
import {calcStartValueForRefresh} from "./util/calc-start-value-for-refresh";

/**
 * @publicApi
 */
export function rxStateful$<T, E = unknown>(source$: Observable<T>): RxStateful<T, E>;
export function rxStateful$<T, E = unknown>(source$: Observable<T>, config: RxStatefulConfig<T,E>): RxStateful<T, E>;
export function rxStateful$<T, E = unknown>(
  source$: Observable<T>,
  config?: RxStatefulConfig<T,E>
): RxStateful<T, E> {
  const error$$ = new Subject<RxStatefulWithError<T, E>>();
  const mergedConfig: RxStatefulConfig<T,E> = {
    keepValueOnRefresh: true,
    keepErrorOnRefresh: false,
    ...config,
  };
  const accumulationFn = mergedConfig.accumulationFn ?? defaultAccumulationFn;


  const refreshTriggerIsBehaivorSubject = (config: RxStatefulConfig<T,E>) =>
    config.refreshTrigger$ instanceof BehaviorSubject;

  const refresh$ = mergedConfig?.refreshTrigger$ ?? new Subject<unknown>();

  const sharedSource$ = source$.pipe(
    share({
      connector: () => new ReplaySubject(1),
    }),
    catchError((error: E) => {
      const errorMappingFn = mergedConfig.errorMappingFn ?? ((error: E ) => (error as any)?.message);
      error$$.next({ error: errorMappingFn(error), context: 'error', hasError: true });
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
           startWith(calcStartValueForRefresh(mergedConfig))

      )
    )
  );

  const state$ = merge(request$, refreshedRequest$, error$$).pipe(
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

  return rxStateful$;
}
