import { of } from 'rxjs';
import { subscribeSpyTo } from '@hirez_io/observer-spy';
import { filterNull } from './filter-null';

describe('filterNull', () => {
  it('should filter null', () => {
    const source$ = of(1, null, 2, null, 3, undefined);
    const result$ = subscribeSpyTo(source$.pipe(filterNull()));

    expect(result$.getValues()).toEqual([1, 2, 3, undefined]);
  });
});
