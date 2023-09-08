import {RefetchStrategy} from "./refetch-strategy";
import {Observable} from "rxjs";

export function mergeRefetchStrategies(refetchStrategies: RefetchStrategy[] | undefined): Observable<any>[] {
    if (!refetchStrategies) {
        return [];
    }
    return refetchStrategies.map(strategy => strategy?.refetchFn()).filter(Boolean);
}
