import {RefetchStrategy} from "./refetch-strategy";
import {BehaviorSubject, Observable, pipe, skip} from "rxjs";


export function mergeRefetchStrategies(refetchStrategies: RefetchStrategy[] | RefetchStrategy | undefined): Observable<any>[] {
    if (!refetchStrategies) {
        return [];
    }
    const strategies: RefetchStrategy[] = Array.isArray(refetchStrategies) ? refetchStrategies : [refetchStrategies];
    return strategies.map(strategy => strategy?.refetchFn().pipe(
      strategy.refetchFn() instanceof BehaviorSubject ? skip(1) : pipe(),
    )).filter(Boolean);

}

