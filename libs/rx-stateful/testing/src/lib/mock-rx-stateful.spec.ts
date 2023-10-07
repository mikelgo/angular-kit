import {mockRxStateful} from "./mock-rx-stateful$";
import {subscribeSpyTo} from "@hirez_io/observer-spy";

describe('mockRxStateful', () => {
    it('should create mock with all properties defined', () => {
        const mock = mockRxStateful()

        expect(mock.instance).toBeTruthy()
        expect(mock.hasError$Trigger).toBeTruthy()
        expect(mock.hasValue$Trigger).toBeTruthy()
        expect(mock.context$Trigger).toBeTruthy()
        expect(mock.value$Trigger).toBeTruthy()
        expect(mock.isSuspense$Trigger).toBeTruthy()
        expect(mock.error$Trigger).toBeTruthy()
        expect(mock.state$Trigger).toBeTruthy()
    })
    it('hasError should emit when state.hasError is given', () => {
        const mock = mockRxStateful()
        const result = subscribeSpyTo(mock.instance.hasError$)
        mock.state$Trigger.next({hasError: true})
        mock.hasError$Trigger.next(true)

        expect(result.getValues()).toEqual([true, true])
    });
    describe('hasValue', () => {
        it('should emit when trigger emits', () => {
            const mock = mockRxStateful()

            const result = subscribeSpyTo(mock.instance.hasValue$)
            mock.hasValue$Trigger.next(true)

            expect(result.getValues()).toEqual([true])
        });
        it('should emit when state trigger emits partial', () => {
            const mock = mockRxStateful()

            const result = subscribeSpyTo(mock.instance.hasValue$)
            mock.state$Trigger.next({hasValue: true})

            expect(result.getValues()).toEqual([true])
        });
        it('should emit when trigger or state trigger emits', () => {
            const mock = mockRxStateful()

            const result = subscribeSpyTo(mock.instance.hasValue$)
            mock.state$Trigger.next({hasValue: true})
            mock.hasValue$Trigger.next(false)

            expect(result.getValues()).toEqual([true, false])
        });
    });
    describe('isSuspense', () => {
        it('should emit when trigger emits', () => {
            const mock = mockRxStateful()

            const result = subscribeSpyTo(mock.instance.isSuspense$)
            mock.isSuspense$Trigger.next(true)

            expect(result.getValues()).toEqual([true])
        });
        it('should emit when state trigger emits partial', () => {
            const mock = mockRxStateful()

            const result = subscribeSpyTo(mock.instance.isSuspense$)
            mock.state$Trigger.next({isSuspense: true})

            expect(result.getValues()).toEqual([true])
        });
        it('should emit when trigger or state trigger emits', () => {
            const mock = mockRxStateful()

            const result = subscribeSpyTo(mock.instance.isSuspense$)
            mock.state$Trigger.next({isSuspense: true})
            mock.isSuspense$Trigger.next(false)

            expect(result.getValues()).toEqual([true, false])
        });
    });
    describe('context', () => {
        it('should emit when trigger emits', () => {
            const mock = mockRxStateful()

            const result = subscribeSpyTo(mock.instance.context$)
            mock.context$Trigger.next('next')

            expect(result.getValues()).toEqual(['next'])
        });
        it('should emit when state trigger emits partial', () => {
            const mock = mockRxStateful()

            const result = subscribeSpyTo(mock.instance.context$)
            mock.state$Trigger.next({context: 'suspense'})

            expect(result.getValues()).toEqual(['suspense'])
        });
        it('should emit when trigger or state trigger emits', () => {
            const mock = mockRxStateful()

            const result = subscribeSpyTo(mock.instance.context$)
            mock.state$Trigger.next({context: 'next'})
            mock.context$Trigger.next('suspense')

            expect(result.getValues()).toEqual(['next', 'suspense'])
        });
    });
    describe('value', () => {
        it('should emit when trigger emits', () => {
            const mock = mockRxStateful()

            const result = subscribeSpyTo(mock.instance.value$)
            mock.value$Trigger.next(1)

            expect(result.getValues()).toEqual([1])
        });
        it('should emit when state trigger emits partial', () => {
            const mock = mockRxStateful()

            const result = subscribeSpyTo(mock.instance.value$)
            mock.state$Trigger.next({value: 1})

            expect(result.getValues()).toEqual([1])
        });
        it('should emit when trigger or state trigger emits', () => {
            const mock = mockRxStateful()

            const result = subscribeSpyTo(mock.instance.value$)
            mock.state$Trigger.next({value: 1})
            mock.value$Trigger.next(2)

            expect(result.getValues()).toEqual([1, 2])
        });
    });
})
