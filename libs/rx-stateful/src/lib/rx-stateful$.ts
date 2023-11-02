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
import {InternalRxState, RxStateful, RxStatefulConfig, RxStatefulWithError, SourceTriggerConfig,} from './types/types';
import {_handleSyncValue} from './util/handle-sync-value';
import {defaultAccumulationFn} from './types/accumulation-fn';
import {createRxStateful} from './util/create-rx-stateful';
import {mergeRefetchStrategies} from "./refetch-strategies/merge-refetch-strategies";
import {deriveConfigFromParams} from "./util/derive-config-from-params";

type FlatteningStrategy = 'switch' | 'merge' | 'concat' | 'exhaust';

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
export function rxStateful$<T, E = unknown>(source$: Observable<T>): Observable< RxStateful<T, E>>;

export function rxStateful$<T,A, E = unknown>(sourceFn$: (arg: A) => Observable<T>, sourceTrigger: SourceTriggerConfig<A>): Observable< RxStateful<T, E>>;
export function rxStateful$<T,A, E = unknown>(sourceFn$: (arg: A) => Observable<T>, sourceTrigger: SourceTriggerConfig<A>, config: RxStatefulConfig<T, E>): Observable< RxStateful<T, E>>;
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
export function rxStateful$<T, E = unknown>(source$: Observable<T>, config: RxStatefulConfig<T, E>): Observable<RxStateful<T, E>>;
export function rxStateful$<T,A, E = unknown>(
    sourceOrSourceFn$: Observable<T> | ((arg: A) => Observable<T>),
    configOrSourceTrigger?: RxStatefulConfig<T, E> | SourceTriggerConfig<A>,
    config?: RxStatefulConfig<T, E>,
): Observable<RxStateful<T, E>> {
    // todo Angular 16
    // const injector = config?.injector ?? inject(Injector);
    // todo Angular-16 runInInjectionContext(injector)

    const mergedConfig: RxStatefulConfig<T, E> = {
        keepValueOnRefresh: false,
        keepErrorOnRefresh: false,
        ...deriveConfigFromParams(configOrSourceTrigger, config),
    };

    return createRxStateful<T, E>(createState$<T,A, E>(sourceOrSourceFn$, mergedConfig, configOrSourceTrigger), mergedConfig);

}


function createState$<T,A, E>(
    sourceOrSourceFn$: Observable<T> | ((arg: A) => Observable<T>),
    mergedConfig: RxStatefulConfig<T, E>,
    configOrSourceTrigger?: RxStatefulConfig<T, E> | SourceTriggerConfig<A>,
) {
    /**
     * TODO
     * CreateState anpassen so dass es auch mit sourceFn$ funktioniert
     * todo von trigger config operator nutzen
     */
    const accumulationFn = mergedConfig.accumulationFn ?? defaultAccumulationFn;
    const error$$ = new Subject<RxStatefulWithError<T, E>>();

    const sharedSource$ =  sourceOrSourceFn$.pipe(
        share({
            connector: () => new ReplaySubject(1),
            resetOnError: true,
            resetOnComplete: true,
            resetOnRefCountZero: true,
        }),
        catchError((error: E) => {
            mergedConfig?.beforeHandleErrorFn?.(error);
            const errorMappingFn = mergedConfig.errorMappingFn ?? ((error: E) => (error as any)?.message);
            error$$.next({ error: errorMappingFn(error), context: 'error',   isLoading: false,
                isRefreshing: false, value: null });
            return NEVER;
        })
    );

    // const refreshedRequest$: Observable<Partial<InternalRxState<T, E>>> = refreshedRequestSource(sharedSource$, mergedConfig)

    const refreshTriggerIsBehaivorSubject = (config: RxStatefulConfig<T, E>) =>
        config.refreshTrigger$ instanceof BehaviorSubject;

    const refresh$ = merge(
        new BehaviorSubject(null),
        mergedConfig?.refreshTrigger$ ?? new Subject<unknown>(),
        ...mergeRefetchStrategies(mergedConfig?.refetchStrategies)
    )
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
                deriveInitialValue<T,E>(mergedConfig)
            )
        )
    ) as Observable<Partial<InternalRxState<T, E>>>





    return merge( refreshedRequest$, error$$).pipe(
        /**
         * todo
         * this is a bit hacky as value can not be undefined (it is typed
         * as T | null). However when I change to null some side effets happen.
         * Need investigation!!!
         */
        // @ts-ignore
        scan(accumulationFn, {
            isLoading: false,
            isRefreshing: false,
            value: undefined,
            error: undefined,
            context: 'suspense',
        }),
        distinctUntilChanged(),
        share({
            connector: () => new ReplaySubject(1),
            resetOnError: true,
            resetOnComplete: true,
            resetOnRefCountZero: true,
        }),
        _handleSyncValue()
    );
}



function deriveInitialValue<T, E>(mergedConfig: RxStatefulConfig<T,E>){
    // TODO for first emission set isRefreshing to false
    let value: Partial<InternalRxState<T, E>> = {
        isLoading: true,
        isRefreshing: true,
        context: 'suspense',
    }
    if (!mergedConfig.keepValueOnRefresh){
        value = {
            ...value,
            value: null
        }

    }
    if (!mergedConfig.keepErrorOnRefresh){
        value = {
            ...value,
            error: undefined
        }
    }


    return startWith(value)
}
