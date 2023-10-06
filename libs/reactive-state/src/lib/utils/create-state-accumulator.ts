import {
    BehaviorSubject,
    connectable,
    distinctUntilChanged,
    filter,
    mergeAll,
    Observable,
    observeOn,
    queueScheduler,
    ReplaySubject,
    scan,
    Subscription,
    tap,
    withLatestFrom
} from 'rxjs';
import { State } from '../types/state';
import { filterUndefined } from './filter-undefined';
import { castToT } from './cast-to-t';
import { coerceObservable } from './coerce-observable';

export type AccumulationFn = <T>(state: T, slice: Partial<T>) => T;
function defaultAccumulator<T>(st: T, sl: Partial<T>): T {
    return { ...st, ...sl };
}

export interface StateAccumulator<T> {
    state: T;
    state$: Observable<T>;

    nextSlice(slice: Partial<T>): void;
    nextSlice(slice: Observable<Partial<T>>): void;
    nextSlice(slice: Partial<T> | Observable<Partial<T>>): void;

    connect(): Subscription;

    nextAccumulator: (fn: AccumulationFn) => void;
}

export function createStateAccumulator<T extends State>(): StateAccumulator<T> {
    const stateSlice$ = new ReplaySubject<Observable<Partial<T>>>();
    const accumulationFn$ = new BehaviorSubject<AccumulationFn>(defaultAccumulator);
    const connectableState$ = connectable<T>(
        stateSlice$.pipe(
            distinctUntilChanged(),
            mergeAll(),
            observeOn(queueScheduler),
            filter(filterUndefined),
            castToT<T>(),
            distinctUntilChanged((previous: T, current: T) =>
                Object.keys(current).every((key: string) => current[key as keyof T] === previous[key as keyof T])
            ),
            withLatestFrom(accumulationFn$.pipe(observeOn(queueScheduler))),
            // scan((acc: T, curr: T) => defaultAccumulator(acc, curr), {} as T),
            scan((state, [slice, accumulationFn]) => accumulationFn(state, slice), {} as T),
            tap({ next: s => (compositionObservable.state = s) })
        ),
        {
            connector: () => new ReplaySubject(),
            resetOnDisconnect: false,
        }
    );

    function nextSlice(slice: Partial<T>): void;
    function nextSlice(slice: Observable<Partial<T>>): void;
    function nextSlice(slice: Partial<T> | Observable<Partial<T>>): void {
        stateSlice$.next(coerceObservable(slice));
    }
    function nextAccumulator(fn: AccumulationFn) {
        accumulationFn$.next(fn);
    }

    const compositionObservable: StateAccumulator<T> = {
        state: {} as T,
        state$: connectableState$.pipe(),
        nextSlice,
        connect: () => connectableState$.connect(),
        nextAccumulator
    };
    return compositionObservable;
}
