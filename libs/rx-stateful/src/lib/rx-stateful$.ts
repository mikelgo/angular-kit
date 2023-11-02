import {
    BehaviorSubject,
    catchError,
    concatMap,
    distinctUntilChanged,
    exhaustMap,
    isObservable,
    map,
    merge,
    mergeMap,
    MonoTypeOperatorFunction,
    NEVER,
    Observable,
    of,
    pipe,
    ReplaySubject,
    scan,
    share,
    skip,
    startWith,
    Subject,
    switchMap,
    tap,
} from 'rxjs';
import {InternalRxState, RxStateful, RxStatefulConfig, RxStatefulWithError, SourceTriggerConfig,} from './types/types';
import {_handleSyncValue} from './util/handle-sync-value';
import {defaultAccumulationFn} from './types/accumulation-fn';
import {createRxStateful} from './util/create-rx-stateful';
import {mergeRefetchStrategies} from "./refetch-strategies/merge-refetch-strategies";
import {deriveConfigFromParams} from "./util/derive-config-from-params";
import {isFunctionGuard, isSourceTriggerConfigGuard} from "./types/guards";


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

    // case 1: SourceTriggerConfig given --> sourceOrSourceFn$ is function
    if (isFunctionGuard(sourceOrSourceFn$) && isSourceTriggerConfigGuard(configOrSourceTrigger)){
   /*     let cachedArgument: A | undefined = undefined
        const s$ = sourceTrigger.pipe(
            tap(arg => cachedArgument = arg),
            switchMap((arg) => source(arg).pipe(startWith({ isSuspense: true }))),
            share({
                connector: () => new ReplaySubject(1),
                resetOnRefCountZero: true,
            })
        );
        const trigger = refreshTrigger;

        const refreshed$ = trigger.pipe(
            //refreshTrigger instanceof BehaviorSubject ? pipe() : startWith(null),
            switchMap((arg) => source(cachedArgument).pipe(startWith({ isSuspense: true }))),
            map((value) => value)
        );
        return merge(refreshed$, s$);*/
        let cachedArgument: A | undefined = undefined
        const valueFromSourceTrigger$ = configOrSourceTrigger.trigger.pipe(
            tap(arg => cachedArgument = arg),
            // TODO consider operator
            switchMap(arg => sourceOrSourceFn$(arg).pipe(
                // TODO is this correct?
                deriveInitialValue<T,E>(mergedConfig)
            )),
            map(
                (v) =>
                    ({ value: v, isLoading: false, isRefreshing: false, context: 'next', error: undefined } as Partial<
                        InternalRxState<T, E>
                    >)
            ),
            catchError((error: E) => {
                mergedConfig?.beforeHandleErrorFn?.(error);
                const errorMappingFn = mergedConfig.errorMappingFn ?? ((error: E) => (error as any)?.message);
                error$$.next({ error: errorMappingFn(error), context: 'error',   isLoading: false,
                    isRefreshing: false, value: null });
                return NEVER;
            })
        )

        const refreshTrigger$ = merge(
            new BehaviorSubject(null),
            mergedConfig?.refreshTrigger$ ?? new Subject<unknown>(),
            ...mergeRefetchStrategies(mergedConfig?.refetchStrategies)
        );

        const refreshedValue$ = refreshTrigger$.pipe(
            //refreshTrigger instanceof BehaviorSubject ? pipe() : startWith(null),
            /**
             * in case the refreshTrigger$ is a BehaviorSubject, we want to skip the first value
             * bc otherwise the emissions are not correct. It will then emit 4 vales instead of 2.
             * the 2 additional values come from isRefreshing which is not correct.
             */
            // @ts-ignore todo
            refreshTriggerIsBehaivorSubject(mergedConfig) ? skip(1) : pipe(),
            /**
             * TODO
             * verify if we can safely ignore that cachedArgument is undefined.
             * Theoretically we need to check if s$ has emitted a value before then cachedArgument is defined.
             */
            // @ts-ignore
            switchMap(() => sourceOrSourceFn$(cachedArgument).pipe(
                map(
                    (v) =>
                        ({ value: v, isLoading: false, isRefreshing: false, context: 'next', error: undefined } as Partial<
                            InternalRxState<T, E>
                        >)
                ),
                // TODO is this correct?
                deriveInitialValue<T,E>(mergedConfig),
                // TOOD is this correct?
                catchError((error: E) => {
                    mergedConfig?.beforeHandleErrorFn?.(error);
                    const errorMappingFn = mergedConfig.errorMappingFn ?? ((error: E) => (error as any)?.message);
                    error$$.next({ error: errorMappingFn(error), context: 'error',   isLoading: false,
                        isRefreshing: false, value: null });
                    return NEVER;
                })
            )),
            map((value) => value)
        );
        return merge(refreshedValue$, valueFromSourceTrigger$, error$$).pipe(
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


        return of({} as InternalRxState<T>)
    }

    // case 2: no SourceTriggerConfig given --> sourceOrSourceFn$ is Observable
    if(isObservable(sourceOrSourceFn$)){
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



    return of({} as InternalRxState<T>)




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


function applyFlatteningOperator<T>(
    operator: 'switch' | 'merge' | 'concat' | 'exhaust' | undefined,
    sourceFn: (arg: T) => Observable<T>
): MonoTypeOperatorFunction<T>{
    return source => {
        switch (operator) {
            case 'switch':
                return source.pipe(switchMap(sourceFn))
            case 'merge':
                return source.pipe(mergeMap(sourceFn))
            case 'concat':
                return source.pipe(concatMap(sourceFn))
            case 'exhaust':
                return source.pipe(exhaustMap(sourceFn))
            default:
                return source.pipe(switchMap(sourceFn))
        }
    }
}
