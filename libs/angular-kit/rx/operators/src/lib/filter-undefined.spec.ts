import { filterUndefined } from './filter-undefined';
import { of } from 'rxjs';
import { subscribeSpyTo } from '@hirez_io/observer-spy';

describe('filterUndefined', () => {
  it('should filter undefined', () => {
    const source$ = of(1, undefined, 2, undefined, 3, null);
    const result$ = subscribeSpyTo(source$.pipe(filterUndefined()));

    expect(result$.getValues()).toEqual([1, 2, 3, null]);
  });
});
