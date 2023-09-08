import {mergeAll, Observable, Subject, throwError} from 'rxjs';
import {subscribeSpyTo} from '@hirez_io/observer-spy';
import {rxStateful$} from './rx-stateful$';
import {fakeAsync, TestBed, tick} from '@angular/core/testing';
import {withRefetchOnTrigger} from './refetch-strategies/refetch-on-trigger.strategy';
import {withAutoRefetch} from './refetch-strategies/refetch-on-auto.strategy';

const test = (description: string, testFn: () => void, testBed?: TestBed) => {
  it(description, () => {
    (testBed ?? TestBed).runInInjectionContext(() => {
      testFn();
    });
  });
};

describe('rxStateful$', () => {
  describe('without refreshTrigger$', () => {
    describe('value$', () => {
      test('should be lazy', () => {
        const source$ = new Subject<number>();
        const result = subscribeSpyTo(rxStateful$<number>(source$).value$);

        expect(result.getValues().length).toEqual(0);
      });
      test('value$ should return the current value ', () => {
        const source$ = new Subject<number | null>();

        const result = subscribeSpyTo(rxStateful$<number | null>(source$).value$);
        source$.next(10);
        source$.next(20);
        source$.next(null);

        expect(result.getValues()).toEqual([10, 20, null]);
      });
    });

    describe('hasValue$', () => {
      test('should return false initially', () => {
        const source$ = new Subject<number>();
        const result = subscribeSpyTo(rxStateful$<number>(source$).hasValue$);

        expect(result.getValues()).toEqual([false]);
      });
      test('should return true if there is a value', () => {
        const source$ = new Subject<number>();
        const result = subscribeSpyTo(rxStateful$<number>(source$).hasValue$);

        source$.next(10);

        expect(result.getValues()).toEqual([false, true]);
      });
    });
    describe('isSuspense$', () => {
      test('should return true and false', () => {
        const source$ = new Subject<number>();
        const result = subscribeSpyTo(rxStateful$<number>(source$).isSuspense$);

        source$.next(10);

        expect(result.getValues()).toEqual([true, false]);
      });
    });
    describe('hasError$', () => {
      test('should return false initially', () => {
        const source$ = new Subject<number>();
        const result = subscribeSpyTo(rxStateful$<number>(source$).hasError$);

        expect(result.getValues()).toEqual([false]);
      });
      test('should return true if there is a error', () => {
        const source$ = new Subject<Observable<any>>();
        const result = subscribeSpyTo(rxStateful$<number>(source$.pipe(mergeAll())).hasError$);

        source$.next(throwError(() => new Error('error')));

        expect(result.getLastValue()).toEqual(true);
      });
    });
    describe('error$', () => {
      test('should not emit when there is no error', () => {
        const source$ = new Subject<number>();
        const result = subscribeSpyTo(rxStateful$<number>(source$).error$);

        expect(result.getLastValue()).toEqual(undefined);
      });
      test('should return the error if there is a error', () => {
        const source$ = new Subject<Observable<any>>();
        const result = subscribeSpyTo(rxStateful$<number>(source$.pipe(mergeAll())).error$);

        source$.next(throwError(() => new Error('error')));

        expect(result.getLastValue()).toEqual('error');
      });
    });
    describe('context$', () => {
      test('should return the correct context', () => {
        const source$ = new Subject<number>();
        const result = subscribeSpyTo(rxStateful$<number>(source$).context$);

        source$.next(10);

        expect(result.getValues()).toEqual(['suspense', 'next']);
      });
    });
  });
  describe('with refreshTrigger$', () => {
    describe('value$', () => {
      test('should be lazy', () => {
        const source$ = new Subject<number>();
        const refreshTrigger$ = new Subject<void>();
        const result = subscribeSpyTo(
          rxStateful$<number>(source$, { refreshTrigger$, keepValueOnRefresh: true }).value$
        );

        expect(result.getValues().length).toEqual(0);
      });
      test('keepValueOnRefresh: true - should return the current value when refreshTrigger$ emits', () => {
        const source$ = new Subject<number>();
        const refreshTrigger$ = new Subject<void>();

        const result = subscribeSpyTo(
          rxStateful$<number>(source$, { refreshTrigger$, keepValueOnRefresh: true }).value$
        );
        source$.next(10);

        refreshTrigger$.next(void 0);
        refreshTrigger$.next(void 0);

        expect(result.getValues()).toEqual([10, 10, 10]);
      });
      test('keepValueOnRefresh: false - should return the current value when refreshTrigger$ emits', () => {
        const source$ = new Subject<number>();
        const refreshTrigger$ = new Subject<void>();

        const result = subscribeSpyTo(
          rxStateful$<number>(source$, { refreshTrigger$, keepValueOnRefresh: false }).value$
        );
        source$.next(10);

        refreshTrigger$.next(void 0);
        refreshTrigger$.next(void 0);

        expect(result.getValues()).toEqual([10, null, 10, null, 10]);
      });
      describe('with refetch strategies', () => {
        test('keepValueOnRefresh: true - should return the current value when withTriggerRefetch emits', () => {
          const source$ = new Subject<number>();
          const refreshTrigger$ = new Subject<void>();

          const result = subscribeSpyTo(
            rxStateful$<number>(source$, {
              keepValueOnRefresh: true,
              refetchStrategies: [withRefetchOnTrigger(refreshTrigger$)],
            }).value$
          );
          source$.next(10);

          refreshTrigger$.next(void 0);
          refreshTrigger$.next(void 0);

          expect(result.getValues()).toEqual([10, 10, 10]);
        });
        test('keepValueOnRefresh: true - should return the current value when autoRefetchStrategy emits', fakeAsync(() => {
          const source$ = new Subject<number>();

          const result = subscribeSpyTo(
            rxStateful$<number>(source$, { keepValueOnRefresh: true, refetchStrategies: [withAutoRefetch(100, 301)] })
              .value$
          );
          source$.next(10);
          tick(500);

          expect(result.getValues()).toEqual([10, 10, 10, 10]);
        }));
        test('keepValueOnRefresh: true - should return the current value when mixed refetch strategies emits', fakeAsync(() => {
          const source$ = new Subject<number>();
          const refreshTrigger1$ = new Subject<void>();
          const refreshTrigger2$ = new Subject<void>();

          const result = subscribeSpyTo(
            rxStateful$<number>(source$, {
              keepValueOnRefresh: true,
              refetchStrategies: [
                withAutoRefetch(100, 301),

                withRefetchOnTrigger(refreshTrigger1$),
                withRefetchOnTrigger(refreshTrigger2$),
              ],
            }).value$
          );
          source$.next(10);
          tick(500);

          refreshTrigger1$.next(void 0);
          refreshTrigger2$.next(void 0);

          expect(result.getValues().length).toEqual(6);
          expect(result.getValues()).toEqual([10, 10, 10, 10, 10, 10]);
        }));
      });
    });
    describe('hasValue$', () => {
      test('should return false - true - true', () => {
        const source$ = new Subject<number>();
        const refreshTrigger$ = new Subject<void>();
        const result = subscribeSpyTo(
          rxStateful$<number>(source$, { refreshTrigger$, keepValueOnRefresh: true }).hasValue$
        );

        source$.next(10);
        refreshTrigger$.next(void 0);

        expect(result.getValues()).toEqual([false, true]);
      });
      test('should return false - true - false - true', () => {
        const source$ = new Subject<number>();
        const refreshTrigger$ = new Subject<void>();
        const result = subscribeSpyTo(
          rxStateful$<number>(source$, { refreshTrigger$, keepValueOnRefresh: false }).hasValue$
        );

        source$.next(10);
        refreshTrigger$.next(void 0);

        expect(result.getValues()).toEqual([false, true, false, true]);
      });
    });
    describe('isSuspense$', () => {
      test('should return false - true - true', () => {
        const source$ = new Subject<number>();
        const refreshTrigger$ = new Subject<void>();
        const result = subscribeSpyTo(
          rxStateful$<number>(source$, { refreshTrigger$, keepValueOnRefresh: true }).isSuspense$
        );

        source$.next(10);
        refreshTrigger$.next(void 0);

        expect(result.getValues()).toEqual([true, false, true, false]);
      });
      test('should return false - true - false - true', () => {
        const source$ = new Subject<number>();
        const refreshTrigger$ = new Subject<void>();
        const result = subscribeSpyTo(
          rxStateful$<number>(source$, { refreshTrigger$, keepValueOnRefresh: false }).isSuspense$
        );

        source$.next(10);
        refreshTrigger$.next(void 0);

        expect(result.getValues()).toEqual([true, false, true, false]);
      });
    });
    describe('context$', () => {
      test('should return the correct context', () => {
        const source$ = new Subject<number>();
        const refreshTrigger$ = new Subject<void>();
        const result = subscribeSpyTo(rxStateful$<number>(source$, { refreshTrigger$ }).context$);

        source$.next(10);
        refreshTrigger$.next(void 0);

        expect(result.getValues()).toEqual(['suspense', 'next', 'suspense', 'next']);
      });
    });
    describe('state$', () => {
      test('should return the correct state', () => {
        const source$ = new Subject<any>();
        const refreshTrigger$ = new Subject<void>();
        const result = subscribeSpyTo(rxStateful$<number>(source$, { refreshTrigger$ }).state$);

        source$.next(10);
        refreshTrigger$.next(void 0);
        // todo #60
        //source$.next(throwError(() => new Error('error')));

        expect(result.getValues()).toEqual([
          { hasValue: false, isSuspense: true, hasError: false, context: 'suspense' },
          { hasValue: true, isSuspense: false, value: 10, hasError: false, context: 'next' },
          { hasValue: false, isSuspense: true, value: null, context: 'suspense', hasError: false },
          { hasValue: true, isSuspense: false, value: 10, context: 'next', hasError: false },
          // { hasValue: true, isSuspense: true, value: null, context: 'suspense', hasError: false },
          //{ hasValue: false, isSuspense: false, value: null, context: 'error', hasError: true, error: 'error' },
        ]);
      });
    });
    describe('hasError$', () => {
      test('should return false true false true', () => {
        const source$ = new Subject<Observable<any>>();
        const refreshTrigger$ = new Subject<void>();
        const result = subscribeSpyTo(rxStateful$<number>(source$.pipe(mergeAll()), { refreshTrigger$ }).hasError$);

        source$.next(throwError(() => new Error('error')));
        refreshTrigger$.next(void 0);
        source$.next(throwError(() => new Error('error')));

        expect(result.getValues()).toEqual([false, true, false, true]);
      });
    });
    describe('Configuration options', () => {
      describe('keepErrorOnRefresh', () => {
        test('should not keep the error on refresh when option is set to false', function () {
          const source$ = new Subject<Observable<any>>();
          const refreshTrigger$ = new Subject<void>();
          const result = subscribeSpyTo(
            rxStateful$<number>(source$.pipe(mergeAll()), { refreshTrigger$, keepErrorOnRefresh: false }).state$
          );

          source$.next(throwError(() => new Error('error')));
          refreshTrigger$.next(void 0);
          source$.next(throwError(() => new Error('error')));

          expect(result.getValues()).toEqual([
            { hasValue: false, isSuspense: true, hasError: false, context: 'suspense', error: undefined },
            { hasValue: false, isSuspense: false, hasError: true, context: 'error', error: 'error' },
            { hasValue: false, isSuspense: true, hasError: false, context: 'suspense', error: undefined, value: null },
            { hasValue: false, isSuspense: false, value: null, hasError: true, context: 'error', error: 'error' },
          ]);
        });

        test('should keep the error on refresh when option is set to true', function () {
          const source$ = new Subject<Observable<any>>();
          const refreshTrigger$ = new Subject<void>();
          const result = subscribeSpyTo(
            rxStateful$<number>(source$.pipe(mergeAll()), { refreshTrigger$, keepErrorOnRefresh: true }).state$
          );

          source$.next(throwError(() => new Error('error')));
          refreshTrigger$.next(void 0);
          source$.next(throwError(() => new Error('error')));

          expect(result.getValues()).toEqual([
            { hasValue: false, isSuspense: true, hasError: false, context: 'suspense', error: undefined },
            { hasValue: false, isSuspense: false, value: undefined, hasError: true, context: 'error', error: 'error' },
            { hasValue: false, isSuspense: true, value: null, hasError: true, context: 'suspense', error: 'error' },
            { hasValue: false, isSuspense: false, value: undefined, hasError: true, context: 'error', error: 'error' },
          ]);
        });
      });
    });
  });
  describe('Configuration', () => {
    test('should execute beforeHandleErrorFn', () => {
      const source$ = new Subject<any>();
      const beforeHandleErrorFn = jest.fn();
      const result = subscribeSpyTo(
        rxStateful$<any>(source$.pipe(mergeAll()), { keepValueOnRefresh: false, beforeHandleErrorFn }).value$
      );

      source$.next(throwError(() => new Error('error')));

      expect(beforeHandleErrorFn).toHaveBeenCalledWith(Error('error'));
      expect(beforeHandleErrorFn).toBeCalledTimes(1);
    });
  });
});
