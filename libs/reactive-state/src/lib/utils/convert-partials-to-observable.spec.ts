import { EMPTY, of } from 'rxjs';
import { subscribeSpyTo } from '@hirez_io/observer-spy';
import { convertPartialsToObservable } from './convert-partials-to-observable';

describe('convertPartialsToObservable', () => {
    it('should emit only one combined value for all inputs', () => {
        const input$ = convertPartialsToObservable<Model>({
            id: of(10),
            a: of('Hi'),
            b: of(true)
        });

        const result = subscribeSpyTo(input$);

        expect(result.getValues()).toEqual([
            {
                id: 10,
                a: 'Hi',
                b: true
            }
        ]);
    });
    it('should emit even if one source does not emit a value', () => {
        const input$ = convertPartialsToObservable<Model>({
            id: of(10),
            a: of('Hi'),
            b: EMPTY
        });

        const result = subscribeSpyTo(input$);

        expect(result.getValues()).toEqual([
            {
                id: 10,
                a: 'Hi',
                b: undefined
            }
        ]);
    });
});

type Model = {
    id: number;
    a?: string;
    b: boolean
}