import {mergeAll, Observable, Subject, throwError} from 'rxjs';
import {subscribeSpyTo} from '@hirez_io/observer-spy';
import {rxStateful$} from './rx-stateful$';

describe('rxStateful$', () => {
  describe('without refreshTrigger$', () => {
    describe('value$', () => {
      it('should be lazy', () => {
        const source$ = new Subject<number>();
        const result = subscribeSpyTo(rxStateful$<number>(source$).value$);

        expect(result.getValues().length).toEqual(0);
      });
      it('value$ should return the current value ', () => {
        const source$ = new Subject<number | null>();

        const result = subscribeSpyTo(rxStateful$<number | null>(source$).value$);
        source$.next(10);
        source$.next(20);
        source$.next(null);

        expect(result.getValues()).toEqual([10, 20, null]);
      });
    });

    describe('hasValue$', () => {
      it('should return false initially', () => {
        const source$ = new Subject<number>();
        const result = subscribeSpyTo(rxStateful$<number>(source$).hasValue$);

        expect(result.getValues()).toEqual([false]);
      });
      it('should return true if there is a value', () => {
        const source$ = new Subject<number>();
        const result = subscribeSpyTo(rxStateful$<number>(source$).hasValue$);

        source$.next(10);

        expect(result.getValues()).toEqual([false, true]);
      });
    });
    describe('isSuspense$', () => {
      it('should return true and false', () => {
        const source$ = new Subject<number>();
        const result = subscribeSpyTo(rxStateful$<number>(source$).isSuspense$);

        source$.next(10);

        expect(result.getValues()).toEqual([true, false]);
      });
    });
    describe('hasError$', () => {
      it('should return false initially', () => {
        const source$ = new Subject<number>();
        const result = subscribeSpyTo(rxStateful$<number>(source$).hasError$);

        expect(result.getValues()).toEqual([false]);
      });
      it('should return true if there is a error', () => {
        const source$ = new Subject<Observable<any>>();
        const result = subscribeSpyTo(rxStateful$<number>(source$.pipe(mergeAll())).hasError$);

        source$.next(throwError(() => new Error('error')));

        expect(result.getLastValue()).toEqual(true);
      });
    });
    describe('error$', () => {
      it('should not emit when there is no error', () => {
        const source$ = new Subject<number>();
        const result = subscribeSpyTo(rxStateful$<number>(source$).error$);

        expect(result.getLastValue()).toEqual(undefined);
      });
      it('should return the error if there is a error', () => {
        const source$ = new Subject<Observable<any>>();
        const result = subscribeSpyTo(rxStateful$<number>(source$.pipe(mergeAll())).error$);

        source$.next(throwError(() => new Error('error')));

        expect(result.getLastValue()).toEqual('error');
      });
    });
    describe('context$', () => {
      it('should return the correct context', () => {
        const source$ = new Subject<number>();
        const result = subscribeSpyTo(rxStateful$<number>(source$).context$);

        source$.next(10);

        expect(result.getValues()).toEqual(['suspense', 'next']);
      });
    });
  });
  describe('with refreshTrigger$', () => {
    describe('value$', () => {
      it('should be lazy', () => {
        const source$ = new Subject<number>();
        const refreshTrigger$ = new Subject<void>();
        const result = subscribeSpyTo(
          rxStateful$<number>(source$, { refreshTrigger$, keepValueOnRefresh: true }).value$
        );

        expect(result.getValues().length).toEqual(0);
      });
      it('keepValueOnRefresh: true - should return the current value when refreshTrigger$ emits', () => {
        const source$ = new Subject<number>();
        const refreshTrigger$ = new Subject<void>();

        const result = subscribeSpyTo(
          rxStateful$<number>(source$, { refreshTrigger$, keepValueOnRefresh: true }).value$
        );
        source$.next(10);

        refreshTrigger$.next();
        refreshTrigger$.next();

        expect(result.getValues()).toEqual([10, 10, 10]);
      });
      it('keepValueOnRefresh: false - should return the current value when refreshTrigger$ emits', () => {
        const source$ = new Subject<number>();
        const refreshTrigger$ = new Subject<void>();

        const result = subscribeSpyTo(
          rxStateful$<number>(source$, { refreshTrigger$, keepValueOnRefresh: false }).value$
        );
        source$.next(10);

        refreshTrigger$.next();
        refreshTrigger$.next();

        expect(result.getValues()).toEqual([10, null, 10, null, 10]);
      });
    });
    describe('hasValue$', () => {
      it('should return false - true - true', () => {
        const source$ = new Subject<number>();
        const refreshTrigger$ = new Subject<void>();
        const result = subscribeSpyTo(
          rxStateful$<number>(source$, { refreshTrigger$, keepValueOnRefresh: true }).hasValue$
        );

        source$.next(10);
        refreshTrigger$.next();

        expect(result.getValues()).toEqual([false, true]);
      });
      it('should return false - true - false - true', () => {
        const source$ = new Subject<number>();
        const refreshTrigger$ = new Subject<void>();
        const result = subscribeSpyTo(
          rxStateful$<number>(source$, { refreshTrigger$, keepValueOnRefresh: false }).hasValue$
        );

        source$.next(10);
        refreshTrigger$.next();

        expect(result.getValues()).toEqual([false, true, false, true]);
      });
    });
    describe('isSuspense$', () => {
      it('should return false - true - true', () => {
        const source$ = new Subject<number>();
        const refreshTrigger$ = new Subject<void>();
        const result = subscribeSpyTo(
          rxStateful$<number>(source$, { refreshTrigger$, keepValueOnRefresh: true }).isSuspense$
        );

        source$.next(10);
        refreshTrigger$.next();

        expect(result.getValues()).toEqual([true, false, true, false]);
      });
      it('should return false - true - false - true', () => {
        const source$ = new Subject<number>();
        const refreshTrigger$ = new Subject<void>();
        const result = subscribeSpyTo(
          rxStateful$<number>(source$, { refreshTrigger$, keepValueOnRefresh: false }).isSuspense$
        );

        source$.next(10);
        refreshTrigger$.next();

        expect(result.getValues()).toEqual([true, false, true, false]);
      });
    });
    describe('context$', () => {
      it('should return the correct context', () => {
        const source$ = new Subject<number>();
        const refreshTrigger$ = new Subject<void>();
        const result = subscribeSpyTo(rxStateful$<number>(source$, { refreshTrigger$ }).context$);

        source$.next(10);
        refreshTrigger$.next();

        expect(result.getValues()).toEqual(['suspense', 'next', 'suspense', 'next']);
      });
    });
    describe('state$', () => {
      it('should return the correct state', () => {
        const source$ = new Subject<number>();
        const refreshTrigger$ = new Subject<void>();
        const result = subscribeSpyTo(rxStateful$<number>(source$, { refreshTrigger$ }).state$);

        source$.next(10);
        refreshTrigger$.next();

        expect(result.getValues()).toEqual([
          { hasValue: false, isSuspense: true, hasError: false, context:'suspense' },
          { hasValue: true, isSuspense: false, value: 10, hasError: false, context: 'next' },
          { hasValue: true, isSuspense: true, value: 10, context: 'suspense', hasError: false },
          { hasValue: true, isSuspense: false, value: 10, context: 'next', hasError: false },
        ]);
      });
    })
    // todo
    //describe('hasError$', () => {});
    //describe('error$', () => {});
  });
});
