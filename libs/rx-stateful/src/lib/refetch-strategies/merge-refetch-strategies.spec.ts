import {mergeRefetchStrategies} from "./merge-refetch-strategies";
import {RefetchStrategy} from "./refetch-strategy";
import {withRefetchOnTrigger} from "./refetch-on-trigger.strategy";
import {BehaviorSubject, ReplaySubject, Subject} from "rxjs";
import {subscribeSpyTo} from "@hirez_io/observer-spy";

describe('mergeRefetchStrategies', () => {
    it('should return empty array when no refetchStrategies are provided', () => {
        expect(mergeRefetchStrategies([])).toEqual([]);
    })

    it('should filter out null or undefined strategies', () => {
        expect(mergeRefetchStrategies([null as unknown as RefetchStrategy, undefined as unknown as RefetchStrategy])).toEqual([]);
    })

    it('should return for each strategy the refetch$ observable', () => {
        const trigger1$ = new Subject();
        const trigger2$ = new ReplaySubject();
        const trigger3$ = new BehaviorSubject<any>(null);
        const strategies: RefetchStrategy[] = [
            withRefetchOnTrigger(trigger1$),
            withRefetchOnTrigger(trigger2$),
            withRefetchOnTrigger(trigger3$),
        ]

        const refetchStrategies = mergeRefetchStrategies(strategies);
        expect(refetchStrategies.length).toEqual(3);


        const first = subscribeSpyTo(refetchStrategies[0]);
        const second = subscribeSpyTo(refetchStrategies[1]);
        const third = subscribeSpyTo(refetchStrategies[2]);

        trigger1$.next(10);
        trigger2$.next(20);
        trigger3$.next(30);

        expect(first.getValues()).toEqual([10]);
        expect(second.getValues()).toEqual([20]);
        expect(third.getValues()).toEqual([null, 30]);

    })
})

