import { Observable } from 'rxjs';
import { coerceObservable } from './coerce-observable';

describe('coerceObservable', () => {
    it('should coerce a value to an observable', done => {
        const value = 'test';
        const result = coerceObservable(value);
        expect(result).toBeInstanceOf(Observable);
        result.subscribe(v => {
            expect(v).toBe(value);
            done();
        });
    });
});