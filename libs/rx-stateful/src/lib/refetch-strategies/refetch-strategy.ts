import {defer, Observable, Subject} from "rxjs";


export type RefetchStrategyKind = 'trigger__rxStateful' | 'auto__rxStateful';

export type RefetchFn = () => Observable<any>;

export type RefetchStrategy = {
    kind: RefetchStrategyKind & string,
    refetchFn: RefetchFn
}

export type TriggerRefetchStrategy = {
    kind: 'trigger__rxStateful',
    refetchFn: RefetchFn
}

export type AutoRefetchStrategy = {
    kind: 'auto__rxStateful',
    refetchFn: RefetchFn
}

export function refetchFnFactory(trigger: Observable<any> | Subject<any>){
    return () => defer(() => trigger)
}
export function refetchStrategyFactory(){}
