import {RxStatefulConfig} from "./types";
import {isObservable, Observable, Subject} from "rxjs";


export function isObservableOrSubjectGuard(arg: any): arg is Observable<any> | Subject<any>{
    return isObservable(arg) || arg instanceof Subject;
}

export function isRxStatefulConfigOrObsGuard<T,E>(arg: any): arg is RxStatefulConfig<T, E>{
    // write type guard for RxStatefulConfig
    return !(isObservableOrSubjectGuard(arg))
}

export function isFunctionGuard(value: any): value is (...args: any[]) => any {
    return typeof value === 'function';
}
