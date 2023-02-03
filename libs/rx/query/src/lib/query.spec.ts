import {Subject} from 'rxjs';
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

  it('with refresh ', () => {
    const source$ = new Subject<number>();
    const refresh$ = new Subject<unknown>();
    const result = subscribeSpyTo(rxQuery$<number>(source$, refresh$));

    source$.next(10);
    refresh$.next(null);

    expect(result.getValues()).toEqual([
      { isLoading: true, isRefreshing: false, value: undefined },
      { isLoading: false, isRefreshing: false, value: 10 },
      { isLoading: true, isRefreshing: true, value: 10 },
      { isLoading: false, isRefreshing: false, value: 10 },
    ]);
  });
});
