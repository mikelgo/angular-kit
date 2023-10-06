import { Observable, of, Subject } from 'rxjs';
import { subscribeSpyTo } from '@hirez_io/observer-spy';
import { createEffect } from './create-effect';

describe('createEffect', () => {
    it('should create', () => {
        const effect = createEffect(new Subject(), () => of(42));
        expect(effect).toBeTruthy();
    });

    it('should emit when trigger is emitted', () => {
        const source$ = of(10);
        const trigger$$ = new Subject();

        const effect = createEffect(trigger$$, () => source$);

        const result = subscribeSpyTo(effect);

        trigger$$.next(void 0);
        trigger$$.next(void 0);

        expect(result.getValues()).toEqual([10, 10]);
    });

    it('should use the argument', () => {
        const trigger = new Subject<number>();

        const get = (id: number): Observable<number> => {
            return of(id);
        };

        const effect = createEffect(trigger, (id: number) => get(id));
        const result = subscribeSpyTo(effect);

        trigger.next(10);
        trigger.next(42);

        expect(result.getValues()).toEqual([10, 42]);
    });
});
