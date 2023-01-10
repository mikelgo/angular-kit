import { rxFilterUndefined } from './rx-filter-undefined';
import { of } from 'rxjs';
import { subscribeSpyTo } from '@hirez_io/observer-spy';

describe('rxFilterUndefined', () => {
  it('should filter undefined', () => {
    const source$ = of(1, undefined, 2, undefined, 3, null);
    const result$ = subscribeSpyTo(source$.pipe(rxFilterUndefined()));

    expect(result$.getValues()).toEqual([1, 2, 3, null]);
  });
});
