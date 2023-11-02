import {mergeAll, Observable, of, scan, Subject, throwError} from 'rxjs';
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
    test('should return the correct state', () => {
      const source$ = new Subject<number>();
      const result = subscribeSpyTo(rxStateful$<number>(source$));

      source$.next(10);
      expect(result.getValues()).toEqual([
        { hasValue: false, isSuspense: true, hasError: false, context: 'suspense', value: null, error: undefined },
        { hasValue: true, isSuspense: false, value: 10, hasError: false, context: 'next', error: undefined },
      ]);
    });
    test('should emit correct state when error happens', () => {
      const source$ = new Subject<Observable<any>>();
      const result = subscribeSpyTo(rxStateful$<number>(source$.pipe(mergeAll())));

      source$.next(throwError(() => new Error('error')));

      expect(result.getValues()).toEqual([
        { hasValue: false, isSuspense: true, hasError: false, context: 'suspense', value: null, error: undefined  },
        { hasValue: false, isSuspense: false, value: null, hasError: true, context: 'error', error: 'error' },
      ]);
    })
  });
  describe('with refreshTrigger$', () => {


    test('should return the correct state', () => {
        const source$ = new Subject<any>();
        const refreshTrigger$ = new Subject<void>();
        const result = subscribeSpyTo(rxStateful$<number>(source$, { refreshTrigger$ }));

        source$.next(10);
        refreshTrigger$.next(void 0);
        // todo #60
        //source$.next(throwError(() => new Error('error')));

        expect(result.getValues()).toEqual([
          { hasValue: false, isSuspense: true, hasError: false, context: 'suspense', value: null, error: undefined  },
          { hasValue: true, isSuspense: false, value: 10, hasError: false, context: 'next', error: undefined },
          { hasValue: false, isSuspense: true, value: null, context: 'suspense', hasError: false , error: undefined},
          { hasValue: true, isSuspense: false, value: 10, context: 'next', hasError: false, error: undefined },
          // { hasValue: true, isSuspense: true, value: null, context: 'suspense', hasError: false },
          //{ hasValue: false, isSuspense: false, value: null, context: 'error', hasError: true, error: 'error' },
        ]);
      });

    test('should emit correct state when error happens', () => {
      const source$ = new Subject<Observable<any>>();
      const refreshTrigger$ = new Subject<void>();
      const result = subscribeSpyTo(rxStateful$<number>(source$.pipe(mergeAll()), { refreshTrigger$ }));

      source$.next(throwError(() => new Error('error')));
      refreshTrigger$.next(void 0);
      source$.next(throwError(() => new Error('error')));

      expect(result.getValues()).toEqual([
        { hasValue: false, isSuspense: true, hasError: false, context: 'suspense', error: undefined, value: null },
        { hasValue: false, isSuspense: false, value: null, hasError: true, context: 'error', error: 'error' },
        { hasValue: false, isSuspense: true, value: null, hasError: false, context: 'suspense', error: undefined },
        { hasValue: false, isSuspense: false, value: null, hasError: true, context: 'error', error: 'error' },
      ]);
    })


    describe('Configuration options', () => {
      describe('keepErrorOnRefresh', () => {
        test('should not keep the error on refresh when option is set to false', function () {
          const source$ = new Subject<Observable<any>>();
          const refreshTrigger$ = new Subject<void>();
          const result = subscribeSpyTo(
            rxStateful$<number>(source$.pipe(mergeAll()), { refreshTrigger$, keepErrorOnRefresh: false })
          );

          source$.next(throwError(() => new Error('error')));
          refreshTrigger$.next(void 0);
          source$.next(throwError(() => new Error('error')));

          expect(result.getValues()).toEqual([
            // todo first emission does not contain value: null?
            { hasValue: false, isSuspense: true, hasError: false, context: 'suspense', error: undefined, value: null },
            { hasValue: false, isSuspense: false, hasError: true, context: 'error', error: 'error', value: null },
            { hasValue: false, isSuspense: true, hasError: false, context: 'suspense', error: undefined, value: null },
            { hasValue: false, isSuspense: false, value: null, hasError: true, context: 'error', error: 'error' },
          ]);
        });

        test('should keep the error on refresh when option is set to true', function () {
          const source$ = new Subject<Observable<any>>();
          const refreshTrigger$ = new Subject<void>();
          const result = subscribeSpyTo(
            rxStateful$<number>(source$.pipe(mergeAll()), { refreshTrigger$, keepErrorOnRefresh: true })
          );

          source$.next(throwError(() => new Error('error')));
          refreshTrigger$.next(void 0);
          source$.next(throwError(() => new Error('error')));

          expect(result.getValues()).toEqual([
              // todo first emission does not contain value: null?
            { hasValue: false, isSuspense: true,  hasError: false, context: 'suspense', error: undefined, value:null },
            { hasValue: false, isSuspense: false, value: null, hasError: true, context: 'error', error: 'error' },
            { hasValue: false, isSuspense: true, value: null, hasError: true, context: 'suspense', error: 'error' },
            { hasValue: false, isSuspense: false, value: null, hasError: true, context: 'error', error: 'error' },
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
        rxStateful$<any>(source$.pipe(mergeAll()), { keepValueOnRefresh: false, beforeHandleErrorFn })
      );

      source$.next(throwError(() => new Error('error')));

      expect(beforeHandleErrorFn).toHaveBeenCalledWith(Error('error'));
      expect(beforeHandleErrorFn).toBeCalledTimes(1);
    });
  });
  describe('with refetch strategies', () => {
    test('keepValueOnRefresh: true - should return the current value when withTriggerRefetch emits', () => {
      const source$ = new Subject<number>();
      const refreshTrigger$ = new Subject<void>();

      const result = subscribeSpyTo(
        rxStateful$<number>(source$, {
          keepValueOnRefresh: true,
          refetchStrategies: [withRefetchOnTrigger(refreshTrigger$)],
        })
      );
      source$.next(10);

      refreshTrigger$.next(void 0);
      refreshTrigger$.next(void 0);

      expect(result.getValues()).toEqual([
        {
          "context": "suspense",
          "hasError": false,
          "hasValue": false,
          "isSuspense": true,
          value: undefined,
          error: undefined
        },
        {
          "context": "next",
          "hasError": false,
          "hasValue": true,
          "isSuspense": false,
          "value": 10
        },
        {
          "context": "suspense",
          "hasError": false,
          "hasValue": true,
          "isSuspense": true,
          "value": 10
        },
        {
          "context": "next",
          "hasError": false,
          "hasValue": true,
          "isSuspense": false,
          "value": 10
        },
        {
          "context": "suspense",
          "hasError": false,
          "hasValue": true,
          "isSuspense": true,
          "value": 10
        },
        {
          "context": "next",
          "hasError": false,
          "hasValue": true,
          "isSuspense": false,
          "value": 10
        }
      ]);
    });
    test('keepValueOnRefresh: true - should return the current value when autoRefetchStrategy emits', fakeAsync(() => {
      const source$ = new Subject<number>();

      const result = subscribeSpyTo(
        rxStateful$<number>(source$, { keepValueOnRefresh: true, refetchStrategies: [withAutoRefetch(100, 301)] })

      );
      source$.next(10);
      tick(500);

      expect(result.getValues()).toEqual([
        {
          "context": "suspense",
          "hasError": false,
          "hasValue": false,
          "isSuspense": true
        },
        {
          "context": "next",
          "hasError": false,
          "hasValue": true,
          "isSuspense": false,
          "value": 10
        },
        {
          "context": "suspense",
          "hasError": false,
          "hasValue": true,
          "isSuspense": true,
          "value": 10
        },
        {
          "context": "next",
          "hasError": false,
          "hasValue": true,
          "isSuspense": false,
          "value": 10
        },
        {
          "context": "suspense",
          "hasError": false,
          "hasValue": true,
          "isSuspense": true,
          "value": 10
        },
        {
          "context": "next",
          "hasError": false,
          "hasValue": true,
          "isSuspense": false,
          "value": 10
        },
        {
          "context": "suspense",
          "hasError": false,
          "hasValue": true,
          "isSuspense": true,
          "value": 10
        },
        {
          "context": "next",
          "hasError": false,
          "hasValue": true,
          "isSuspense": false,
          "value": 10
        }
      ]);
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
        })

      );
      source$.next(10);
      tick(500);

      refreshTrigger1$.next(void 0);
      refreshTrigger2$.next(void 0);

      expect(result.getValues().length).toEqual(12);
      expect(result.getValues()).toEqual([
        {
          "context": "suspense",
          "hasError": false,
          "hasValue": false,
          "isSuspense": true
        },
        {
          "context": "next",
          "hasError": false,
          "hasValue": true,
          "isSuspense": false,
          "value": 10
        },
        {
          "context": "suspense",
          "hasError": false,
          "hasValue": true,
          "isSuspense": true,
          "value": 10
        },
        {
          "context": "next",
          "hasError": false,
          "hasValue": true,
          "isSuspense": false,
          "value": 10
        },
        {
          "context": "suspense",
          "hasError": false,
          "hasValue": true,
          "isSuspense": true,
          "value": 10
        },
        {
          "context": "next",
          "hasError": false,
          "hasValue": true,
          "isSuspense": false,
          "value": 10
        },
        {
          "context": "suspense",
          "hasError": false,
          "hasValue": true,
          "isSuspense": true,
          "value": 10
        },
        {
          "context": "next",
          "hasError": false,
          "hasValue": true,
          "isSuspense": false,
          "value": 10
        },
        {
          "context": "suspense",
          "hasError": false,
          "hasValue": true,
          "isSuspense": true,
          "value": 10
        },
        {
          "context": "next",
          "hasError": false,
          "hasValue": true,
          "isSuspense": false,
          "value": 10
        },
        {
          "context": "suspense",
          "hasError": false,
          "hasValue": true,
          "isSuspense": true,
          "value": 10
        },
        {
          "context": "next",
          "hasError": false,
          "hasValue": true,
          "isSuspense": false,
          "value": 10
        }
      ]);
    }));
  });
  describe('sourcetrigger', () => {
    it('should use argument of sourceTrigger', () => {
      const trigger$$ = new Subject<number>()
      const trigger$ = trigger$$.pipe(
          scan((acc, val )=> acc + val, 0)
      )
      const refetch$$ = new Subject<null>()
      const result = subscribeSpyTo(
          rxStateful$((n: number) => of(n), {
            sourceTriggerConfig: {
              trigger: trigger$
            },
            refetchStrategies: [
                withRefetchOnTrigger(refetch$$)
            ]
          })
      )

        trigger$$.next(1)
        trigger$$.next(1)
        refetch$$.next(null)
      expect(result.getValues()).toEqual([
        { hasValue: false, isSuspense: true, hasError: false, context: 'suspense', value: null, error: undefined },
        { hasValue: true, isSuspense: false, value: 1, hasError: false, context: 'next', error: undefined },
        { hasValue: false, isSuspense: true, hasError: false, context: 'suspense', value: null, error: undefined },
        { hasValue: true, isSuspense: false, value: 2, hasError: false, context: 'next', error: undefined },
        { hasValue: false, isSuspense: true, hasError: false, context: 'suspense', value: null, error: undefined },
        { hasValue: true, isSuspense: false, value: 2, hasError: false, context: 'next', error: undefined },
      ])
    })
  })

});
