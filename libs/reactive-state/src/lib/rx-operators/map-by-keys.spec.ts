import { of } from 'rxjs';
import { subscribeSpyTo } from '@hirez_io/observer-spy';
import { mapByKeys } from './map-by-keys';

describe('mapByKeys', () => {
    it('should return Observable with keys a and b selected', () => {
        const value: TestModel = {
            id: 10,
            a: 'a',
            b: 'b',
            c: 100
        };
        const source$ = of(value).pipe(mapByKeys(['a', 'b']));

        const result = subscribeSpyTo(source$);

        expect(result.getValues()).toEqual([{ a: value.a, b: value.b }]);
    });
});

interface TestModel {
    id: number;
    a: string;
    b: string;
    c: number;
}
