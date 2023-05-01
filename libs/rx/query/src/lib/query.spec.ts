import {BehaviorSubject, Subject} from 'rxjs';
import {rxQuery$} from './rxQuery';
import {subscribeSpyTo} from '@hirez_io/observer-spy';

describe('query$', () => {
  it('without refresh ', () => {
    const source$ = new Subject<number>();
    const result = subscribeSpyTo(rxQuery$<number>(source$));

    source$.next(10);
    source$.next(20);

    expect(result.getValues()).toEqual([
      { isLoading: true, isRefreshing: false, value: undefined },
      { isLoading: false, isRefreshing: false, value: 10 },
      { isLoading: false, isRefreshing: false, value: 20 },
    ]);
  });



  describe('with refresh', () => {
    it('subject ', () => {
      const source$ = new Subject<number>();
      const refresh$ = new Subject<unknown>();
      const result = subscribeSpyTo(rxQuery$<number>(source$, { refreshTrigger$: refresh$ }));

      source$.next(10);
      refresh$.next(null);

      expect(result.getValues()).toEqual([
        { isLoading: true, isRefreshing: false, value: undefined },
        { isLoading: false, isRefreshing: false, value: 10 },
        { isLoading: true, isRefreshing: true, value: 10 },
        { isLoading: false, isRefreshing: false, value: 10 },
      ]);
    });
    it('BehaivorSubject ', () => {
      const source$ = new Subject<number>();
      const refresh$ = new BehaviorSubject<unknown>(null);
      const result = subscribeSpyTo(rxQuery$<number>(source$, { refreshTrigger$: refresh$ }));

      source$.next(10);
      refresh$.next(null);

      expect(result.getValues()).toEqual([
        { isLoading: true, isRefreshing: false, value: undefined },
        { isLoading: false, isRefreshing: false, value: 10 },
        { isLoading: true, isRefreshing: true, value: 10 },
        { isLoading: false, isRefreshing: false, value: 10 },
      ]);
    });
  })

  describe('keepValueOnRefresh', () => {
    it('should keep value on refresh by default', () => {
      const source$ = new Subject<number>();
      const refresh$ = new Subject<unknown>();
      const result = subscribeSpyTo(rxQuery$<number>(source$, { refreshTrigger$: refresh$ }));

      source$.next(10);
      refresh$.next(null);

      expect(result.getValues()).toEqual([
        { isLoading: true, isRefreshing: false, value: undefined },
        { isLoading: false, isRefreshing: false, value: 10 },
        { isLoading: true, isRefreshing: true, value: 10 },
        { isLoading: false, isRefreshing: false, value: 10 },
      ]);
    });
    it('should keep value on refresh when keepValueOnRefresh is true', () => {
      const source$ = new Subject<number>();
      const refresh$ = new Subject<unknown>();
      const result = subscribeSpyTo(rxQuery$<number>(source$, { refreshTrigger$: refresh$, keepValueOnRefresh: true }));

      source$.next(10);
      refresh$.next(null);

      expect(result.getValues()).toEqual([
        { isLoading: true, isRefreshing: false, value: undefined },
        { isLoading: false, isRefreshing: false, value: 10 },
        { isLoading: true, isRefreshing: true, value: 10 },
        { isLoading: false, isRefreshing: false, value: 10 },
      ]);
    });
    it('should not keep value on refresh when keepValueOnRefresh is false', () => {
      const source$ = new Subject<number>();
      const refresh$ = new Subject<unknown>();
      const result = subscribeSpyTo(rxQuery$<number>(source$, { refreshTrigger$: refresh$, keepValueOnRefresh: false }));

      source$.next(10);
      refresh$.next(null);

      expect(result.getValues()).toEqual([
        { isLoading: true, isRefreshing: false, value: undefined },
        { isLoading: false, isRefreshing: false, value: 10 },
        { isLoading: true, isRefreshing: true, value: null },
        { isLoading: false, isRefreshing: false, value: 10 },
      ]);
    });

  });
});
