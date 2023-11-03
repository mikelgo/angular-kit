import {concatMap, exhaustMap, mergeMap, Observable, OperatorFunction, switchMap} from "rxjs";

export function applyFlatteningOperator<A, T>(
    operator: 'switch' | 'merge' | 'concat' | 'exhaust' | undefined,
    sourceFn: (arg: A) => Observable<T>
): OperatorFunction<A, T> {

    switch (operator) {
        case 'switch':
            return switchMap(sourceFn)
        case 'merge':
            return mergeMap(sourceFn)
        case 'concat':
            return concatMap(sourceFn)
        case 'exhaust':
            return exhaustMap(sourceFn)
        default:
            return switchMap(sourceFn)
    }

}
