import {rxStateful$} from '@angular-kit/rx-stateful';
import {of} from 'rxjs';
import {pickResponseType} from './pick-response-type.operator';
import {subscribeSpyTo} from '@hirez_io/observer-spy';
import {TestBed} from '@angular/core/testing';

const testInInjectionContet = (description: string, testFn: () => void) => {
    it(description, () => {
        TestBed.runInInjectionContext(() => {
            testFn();
        });
    });
};

describe('pickResponseType', () => {
    testInInjectionContet('should return whole state by default', () => {
        const rxStateful = createSource();

        const result = subscribeSpyTo(rxStateful.pipe(pickResponseType()));

        expect(result.getLastValue()).toEqual({
            context: 'next',
            hasError: false,
            hasValue: true,
            isSuspense: false,
            value: 10,
        });
    });
    testInInjectionContet('pick state', () => {
        const rxStateful = createSource();

        const result = subscribeSpyTo(rxStateful.pipe(pickResponseType('state')));

        expect(result.getLastValue()).toEqual({
            context: 'next',
            hasError: false,
            hasValue: true,
            isSuspense: false,
            value: 10,
        });
    });

    testInInjectionContet('pick hasError', () => {
        const rxStateful = createSource();

        const result = subscribeSpyTo(rxStateful.pipe(pickResponseType('hasError')));

        expect(result.getLastValue()).toEqual(false);
    });
    testInInjectionContet('pick hasValue', () => {
        const rxStateful = createSource();

        const result = subscribeSpyTo(rxStateful.pipe(pickResponseType('hasValue')));

        expect(result.getLastValue()).toEqual(true);
    });

    testInInjectionContet('pick error', () => {
        const rxStateful = createSource();

        const result = subscribeSpyTo(rxStateful.pipe(pickResponseType('error')));

        expect(result.getLastValue()).toEqual(undefined);
    });
    testInInjectionContet('pick value', () => {
        const rxStateful = createSource();

        const result = subscribeSpyTo(rxStateful.pipe(pickResponseType('value')));

        expect(result.getLastValue()).toEqual(10);
    });

    testInInjectionContet('pick context', () => {
        const rxStateful = createSource();

        const result = subscribeSpyTo(rxStateful.pipe(pickResponseType('context')));

        expect(result.getLastValue()).toEqual('next');
    });
});

function createSource() {
    return rxStateful$<number, Error>(of(10)).state$;
}

