import {Subject} from "rxjs";
import {withAutoRefetch} from "./refetch-on-auto.strategy";
import {fakeTime, subscribeSpyTo} from "@hirez_io/observer-spy";
import {fakeAsync, tick} from "@angular/core/testing";

describe('withAutoRefetch', () => {
    it('should throw error if takeForMs is negative', () => {
        expect(() => withAutoRefetch(100, -1000)).toThrowError();
    });
    it('should throw error if time is negative', () => {
        expect(() => withAutoRefetch(-100, 1000)).toThrowError();
    });

    it('should emit until takeForMs time is reached', fakeTime((flush) => {
        const strategy = withAutoRefetch(100, 1000);

        const result = subscribeSpyTo(strategy.refetchFn());

        flush()

        // it does emit 9 values because the first value is emitted after 100ms
        expect(result.getValues().length).toEqual(9);

    }));

    it('should emit until takeUntilTrigger emits', fakeAsync(() => {
        const takeUntilTrigger = new Subject<any>();
        const strategy = withAutoRefetch(100, takeUntilTrigger);
        const result = subscribeSpyTo(strategy.refetchFn());
        tick(499)
        takeUntilTrigger.next(null);
        tick(200)
        // it does emit 4 values because the first value is emitted after 100ms
        // then source is closed
        expect(result.getValues().length).toEqual(4);
    }));
})
