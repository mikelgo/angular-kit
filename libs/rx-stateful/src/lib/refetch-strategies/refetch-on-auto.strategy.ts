import {interval, Observable, Subject, takeUntil, timer} from "rxjs";
import {AutoRefetchStrategy, refetchFnFactory} from "./refetch-strategy";

/**
 * Creates a refetch strategy that will refetch the data periodically
 * @param intervalMs - The interval in milliseconds on which the data will be refetched
 * @param takeForMs - The time in milliseconds for which the data will be refetched. After this time the refetch will stop.
 *
 * @example
 * withAutoRefetch(1000, 5000);
 * Will refetch the data every second for 5 seconds
 */
export function withAutoRefetch(intervalMs: number, takeForMs: number) : AutoRefetchStrategy
/**
 * Creates a refetch strategy that will refetch the data periodically
 * @param intervalMs - The interval in milliseconds on which the data will be refetched
 * @param takeUntilTrigger - A trigger that will stop the refetch when it emits
 *
 * @example
 * const trigger = new Subject();
 * withAutoRefetch(1000, trigger);
 * Will refetch the data every second until the trigger emits
 */
export function withAutoRefetch(intervalMs: number, takeUntilTrigger: Observable<any> | Subject<any>): AutoRefetchStrategy
export function withAutoRefetch(intervalMs: number, takeForMsOrTrigger: number | Observable<any> | Subject<any>): AutoRefetchStrategy{
    const terminationSignal = isObservableOrSubject(takeForMsOrTrigger) ? takeForMsOrTrigger : timer(getTime(takeForMsOrTrigger));
    const trigger = refetchFnFactory(interval(getTime(intervalMs)).pipe(takeUntil(terminationSignal)));
    return {
        kind: 'auto__rxStateful',
        refetchFn: trigger
    };
}

function getTime(takeForMsOrTrigger: number):number {
    if (takeForMsOrTrigger < 0 ) {
        throw new Error(`You passed a negative number as parameter to ${withAutoRefetch.name}. Only positive numbers are allowed`);
    }
    return takeForMsOrTrigger;
}
export function isObservableOrSubject(arg: any): arg is Observable<any> | Subject<any>{
    return isObservable(arg) || arg instanceof Subject;
}

/**
 * Returns true if the object is a function.
 * @param value The value to check
 */
export function isFunction(value: any): value is (...args: any[]) => any {
    return typeof value === 'function';
}
export function isObservable(obj: any): obj is Observable<unknown> {
    // The !! is to ensure that this publicly exposed function returns
    // `false` if something like `null` or `0` is passed.
    return !!obj && (obj instanceof Observable || (isFunction(obj.lift) && isFunction(obj.subscribe)));
}
