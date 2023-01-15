import {TestScheduler} from 'rxjs/internal/testing/TestScheduler';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import {observableMatcher} from '@angular-kit/testing';
import {rxDistinctUntilChanged} from './rx-distinct-until-changed';

describe('rxDistinctUntilChanged', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(observableMatcher);
  });

  it('should distinguish between primitive values', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -1--2-2----1-3-|');
      const e1subs = '  ^--------------!';
      const expected = '-1--2------1-3-|';

      expectObservable(e1.pipe(rxDistinctUntilChanged())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should distinguish between complex values', () => {
    testScheduler.run(({ hot, expectObservable }) => {
      const a = {
        a: 1,
        b: {
          c: {
            d: 'a',
          },
        },
      };
      const b = {
        a: 1,
        dd: {
          e: ['a', 'b', 'c'],
        },
      };
      const e1 = hot('--a--a--b-|', { a, b });
      const expected = '--a-----b-|';

      expectObservable(e1.pipe(rxDistinctUntilChanged())).toBe(expected, { a, b });
    });
  });
});
