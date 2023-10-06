import { defer, Observable, of } from 'rxjs';
import { fakeAsync, tick } from '@angular/core/testing';
import { createStateAccumulator, StateAccumulator } from './create-state-accumulator';

describe('createStateAccumulator', () => {
    let accumulator: StateAccumulator<State>;
    beforeEach(() => (accumulator = createStateAccumulator<State>()));
    describe('connected accumulator', () => {
        beforeEach(() => accumulator.connect());

        it('should subscribe eagerly to sources by default', () => {
            const value: Partial<State> = { id: 10 };
            const source$: Observable<Partial<State>> = defer(() => of(value));

            accumulator.nextSlice(source$);

            expect(accumulator.state).toEqual(value);
        });
    });
    describe('accumulator is not connected', () => {
        it('should not subscribe eagerly to sources', () => {
            const value: Partial<State> = { id: 10 };
            const source$: Observable<Partial<State>> = defer(() => of(value));

            accumulator.nextSlice(source$);

            expect(accumulator.state).toEqual({});
        });
        it('should return current state when accumulator is connected', fakeAsync(() => {
            const value: Partial<State> = { id: 10 };
            const source$: Observable<Partial<State>> = defer(() => of(value));

            accumulator.nextSlice(source$);

            expect(accumulator.state).toEqual({});

            accumulator.connect();
            tick(10);

            expect(accumulator.state).toEqual(value);
        }));
    });
});

interface State {
    id: number;
    name: string;
    some: {
        a: number;
        b: boolean;
    };
}
