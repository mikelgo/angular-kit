import {mockRxStateful} from "./mock-rx-stateful$";
import {subscribeSpyTo} from "@hirez_io/observer-spy";

describe('mockRxStateful', () => {
    it('should create mock with all properties defined', () => {
        const mock = mockRxStateful()

        expect(mock.instance).toBeTruthy()
        expect(mock.state$Trigger).toBeTruthy()
    })
    describe('state$Trigger', () => {
        it('should emit when trigger emits', () => {
            const mock = mockRxStateful()

            const result = subscribeSpyTo(mock.instance)
            mock.state$Trigger.next({isSuspense: true})
            mock.state$Trigger.next({hasValue: true, value: 'test'})

            expect(result.getValues()).toEqual([{isSuspense: true}, {hasValue: true, value: 'test'}])
        });

    });

})
