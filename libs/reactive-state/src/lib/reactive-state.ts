import { Injectable, OnDestroy } from '@angular/core';
import { distinctUntilChanged, isObservable, map, Observable, Subscription } from 'rxjs';
import { mapByKeys } from './rx-operators/map-by-keys';
import { rxDistinctUntilKeysChange } from './rx-operators/rx-distinct-until-keys-change';
import { isKeyOf } from './types/is-key-of';
import { ProjectStateFn } from './types/project-state-fn';
import { MapFn } from './types/map-fn';
import { isFunction, isObject, isPartialOfObservables, isProjectStateFn } from './types/guards';
import { AccumulationFn, createStateAccumulator, StateAccumulator } from './utils/create-state-accumulator';
import { State } from './types/state';
import { convertPartialsToObservable } from './utils/convert-partials-to-observable';
import { ProjectStateReducerFn } from './types/project-state-reducer-fn';

/**
 * @internal
 */
@Injectable()
export class ReactiveState<T extends State> implements OnDestroy {
    private readonly sub = new Subscription();
    private readonly stateAccumulator: StateAccumulator<T> = createStateAccumulator<T>();
    readonly state$: Observable<T> = this.stateAccumulator.state$;

    constructor() {
        /**
         * Connect to state accumulator. The stream is hot from here on.
         */
        this.sub.add(this.stateAccumulator.connect());
    }

    ngOnDestroy() {
        this.sub.unsubscribe();
    }

    /**
     * Allows to define a custom accumulation function which is used to calculate the state.
     *
     * This is especially useful if you want to implement deep, immutable updates.
     *
     * @example
     * ```typescript
     * import {produce} from 'immer'
     * function immerReducer<State, Next>(
     *    callback: (state: State, next: Next) => State | void,
     * ) {
     *    return (state: State | undefined, next: Next) => {
     *        return produce(state, (draft: State) => callback(draft, next)) as State;
     *    };
     * }
     * const immerAccumulatorFn = (state, partial) => immerReducer({...state, ...partial})
     * ```
     */
    useAccumulatorFn(accumulatorFn: AccumulationFn){
        this.stateAccumulator.nextAccumulator(accumulatorFn)
    }

    /**
     * Initialize the state
     *
     * @example
     * state.initialize({a: '', b: true})
     */
    initialize(state: Partial<T>): void;
    /**
     * Initialize the state and connect component inputs
     *
     * @example
     * state.initialize({a: '', b: true}, useOnChanges$(this))
     */
    initialize(state: Partial<T>, inputs$: Observable<Partial<T>>): void;
    initialize(state: Partial<T>, inputs$?: Observable<Partial<T>>): void {
        /**
         * The initialize method takes only a Partial<T> as initialstate and does not require the whole state
         * to improve developer ergonomics. E.g. in a log of cases you want to define something in your state
         * which is derived from connecting a source.
         */
        this.stateAccumulator.nextSlice(state);
        if (inputs$) {
            this.stateAccumulator.nextSlice(inputs$);
        }
    }

    /**
     * Patch a partial of the state
     *
     * @example
     * state.patch({a: 'some value'})
     */
    patch(object: Partial<T>): void;
    /**
     * Patch a state-partial using a projection function
     *
     * @example
     * state.patch(state => ({a: state.a + 1}))
     */
    patch(projectionFn: ProjectStateFn<T>): void;
    /**
     * Patch a partial of the state. It will loop over all the properties of the passed
     * object and only next the state once.
     * @param object
     */
    patch(objectOrProjectFn: Partial<T> | ProjectStateFn<T>): void {
        let newState: T = { ...this.snapshot() };
        if (isProjectStateFn(objectOrProjectFn)) {
            newState = {
                ...newState,
                ...objectOrProjectFn(this.stateAccumulator.state)
            };
        }
        if (isObject(objectOrProjectFn)) {
            Object.keys(objectOrProjectFn).forEach((key: string) => {
                // todo
                // @ts-ignore
                newState = { ...newState, [key]: objectOrProjectFn[key as keyof T] };
            });
        }

        this.stateAccumulator.nextSlice(newState);
    }

    /**
     * Connect partial reactive pieces of your state
     *
     * @example
     * state.connect({a: of(...), b: this.http.get(...)})
     */
    connect(object: Partial<{ [P in keyof T]: Observable<T[P]> }>): void;
    /**
     * Connect to your state by providing a projection function
     *
     * @example
     * state.connect(state => ({b: state.b + 1}))
     */
    connect(projectFn: ProjectStateFn<T>): void;
    /**
     * Connect a state slice together with a projection function
     *
     * @example
     * state.connect(of(10), (state, value) => ({b: state.b + value}))
     */
    connect<V>(slice$: Observable<Partial<V>>, projectStateFn: ProjectStateReducerFn<T, V>): void
    connect<V>(
        objectOrProjectFn: Partial<{ [P in keyof T]: Observable<T[P]> }> | ProjectStateFn<T> | Observable<Partial<V>>,
        projectStateFn?: ProjectStateReducerFn<T, V>
    ): void {
        if (isObservable(objectOrProjectFn) && projectStateFn){
            const projectionStateFn = projectStateFn
            const slice$ = objectOrProjectFn.pipe(
                map(v => projectionStateFn(this.stateAccumulator.state, v as V))
            )
            this.stateAccumulator.nextSlice(slice$)
            return;
        }
        if (isProjectStateFn(objectOrProjectFn)) {
            this.stateAccumulator.nextSlice(objectOrProjectFn(this.stateAccumulator.state));
            return;
        }

        if (isPartialOfObservables(objectOrProjectFn)) {
            // @ts-ignore
            this.stateAccumulator.nextSlice(convertPartialsToObservable(objectOrProjectFn));
            return;
        }
    }

    /**
     * Returns the current value of the state
     *
     * @example
     * const currentState = state.snapshot()
     */
    snapshot(): T {
        return this.stateAccumulator.state;
    }

    /**
     * Pick pieces of the state and create an object that has Observables for every key that is passed.
     *
     * Caution: If the state has no value (not initialized or values patched) then
     * this function will error out
     *
     * @example
     * const picked = state.pick(['a', 'b']) -> {a: Observable, b: Observable}
     *
     */
    pick(keys: Array<keyof T>): Partial<{ [P in keyof T]: Observable<T[P]> }> {
        const returnObj: Partial<{ [P in keyof T]: Observable<T[P]> }> = {};
        keys.forEach((key: keyof T) => {
            returnObj[key] = this.selectWhenKeysChange([key]).pipe(map((state: T) => state[key]));
        });
        return returnObj;
    }

    /**
     * @description
     * Select the complete state as cached and distinct stream.
     *
     * @example
     * const state$ = state.select()
     */
    select(): Observable<T>;
    /**
     * @description
     * Select a slate slice
     *
     * @example
     * const state$ = state.select(state => ({a: state.xx})
     */
    select<R>(mapFn: MapFn<T, R>): Observable<R>;
    /**
     * @description
     * Select a state slice by key
     *
     * @example
     * const state$ = state.select('a')
     *
     */
    select<P extends keyof T>(key: P): Observable<T[P]>;
    /**
     * @description
     * Select a state slice by key's
     *
     * @example
     * const state$ = state.select(['a', 'b'])
     *
     */
    select(keys: Array<keyof T>): Observable<Partial<T>>;
    select<P extends keyof T, R>(
        arg?: MapFn<T, R> | P | Array<keyof T>
    ): Observable<T> | Observable<R> | Observable<T[P]> | Observable<Partial<T>> {
        if (!arg) {
            return this.state$;
        }
        if (isFunction(arg)) {
            return this.state$.pipe(map(arg), distinctUntilChanged());
        }
        if (isKeyOf(arg)) {
            return this.selectWhenKeysChange([arg]).pipe(map(state => state[arg]));
        }
        if (Array.isArray(arg)) {
            const keys: Array<keyof T> = arg;
            return this.state$.pipe(mapByKeys(keys), rxDistinctUntilKeysChange(keys));
        }

        return this.state$;
    }

    /**
     * Returns the entire state when one of the properties matching the passed keys changes
     *
     * @example
     * const selected$ = this.state.selectWhenKeysChange(['a])
     * --> emits T, but only when property 'a' changes
     * @param keys
     */
    selectWhenKeysChange(keys: Array<keyof T>): Observable<T> {
        return this.state$.pipe(
            distinctUntilChanged((previous: T, current: T) =>
                keys.every((key: keyof T) => current[key] === previous[key])
            )
        );
    }
}
