import { of } from 'rxjs';
import { subscribeSpyTo } from '@hirez_io/observer-spy';
import { rxFilterForValue } from './rx-filter-for-value';

describe('rxFilterForValue', () => {
  it('should filter null and undefined', () => {
    const source$ = of(1, null, 2, null, 3, undefined);
    const result$ = subscribeSpyTo(source$.pipe(rxFilterForValue()));

    expect(result$.getValues()).toEqual([1, 2, 3]);
  });
});
