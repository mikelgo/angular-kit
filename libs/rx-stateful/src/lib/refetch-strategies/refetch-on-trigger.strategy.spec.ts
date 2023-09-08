import {of, Subject} from "rxjs";
import {RefetchTrigger, withRefetchOnTrigger} from "./refetch-on-trigger.strategy";
import {subscribeSpyTo} from "@hirez_io/observer-spy";

describe('withRefetchOnTrigger', () => {
    it('should return a trigger strategy when an Subject is provided', () => {
        const trigger = new Subject()
        const strategy = withRefetchOnTrigger(trigger);

        expect(strategy.kind).toEqual('trigger__rxStateful');
        expect(strategy.refetchFn).toBeDefined();

        const result = subscribeSpyTo(strategy.refetchFn());
        trigger.next(10);

        expect(result.getValues()).toEqual([10]);
    })

    it('should return a trigger strategy when an Observable is provided', () => {
        const trigger = of(10)
        const strategy = withRefetchOnTrigger(trigger);

        expect(strategy.kind).toEqual('trigger__rxStateful');
        expect(strategy.refetchFn).toBeDefined();

        const result = subscribeSpyTo(strategy.refetchFn());

        expect(result.getValues()).toEqual([10]);
    })
    describe('RefetchTrigger', () => {
       it('should return a trigger strategy when a RefetchTrigger is provided', () => {
           const triggerSource = new Subject()
           const teardownSource = new Subject()
           const trigger: RefetchTrigger = {
               trigger: triggerSource,
               teardown: teardownSource
           }
           const strategy = withRefetchOnTrigger(trigger);

           expect(strategy.kind).toEqual('trigger__rxStateful');
           expect(strategy.refetchFn).toBeDefined();

           const result = subscribeSpyTo(strategy.refetchFn());
           // @ts-ignore
           trigger.trigger.next(10);

           expect(result.getValues()).toEqual([10]);
       })
   })
    describe('Subscriptions', () => {

        it('should unsubsribe', async () => {
            const trigger = of(10)
            const strategy = withRefetchOnTrigger(trigger);

            expect(strategy.kind).toEqual('trigger__rxStateful');
            expect(strategy.refetchFn).toBeDefined();

            const result = subscribeSpyTo(strategy.refetchFn());

            await result.onComplete();

            expect(result.receivedComplete()).toBe(true);
        })

        it('should unsubsribe when teardown subject emits', async () => {
            const triggerSource = new Subject()
            const teardownSource = new Subject()
            const trigger: RefetchTrigger = {
                trigger: triggerSource,
                teardown: teardownSource
            }
            const strategy = withRefetchOnTrigger(trigger);

            const result = subscribeSpyTo(strategy.refetchFn());

            teardownSource.next(null);
            await result.onComplete();

            expect(result.receivedComplete()).toBe(true);
        })
    })


})
