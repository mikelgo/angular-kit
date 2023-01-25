// create marble tests for rxSwitchMap operator

import {rxSwitchMap} from './rx-switchmap';
import {TestScheduler} from 'rxjs/internal/testing/TestScheduler';
import {createError, createErrorSource, createSourceTrigger, observableMatcher} from '@test-helpers';
import {map, of} from 'rxjs';
import {subscribeSpyTo} from '@hirez_io/observer-spy';

describe('rxSwitchMap', () => {
  describe('marble tests', () => {
    let testScheduler: TestScheduler;

    beforeEach(() => {
      testScheduler = new TestScheduler(observableMatcher);
    });

    it('should map-and-flatten each item to an Observable', () => {
      testScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
        const e1 = hot('   --1-----3--5-------|');
        const e1subs = '   ^------------------!';
        const e2 = cold('    x-x-x|            ', { x: 10 });
        //                         x-x-x|
        //                            x-x-x|
        const expected = ' --x-x-x-y-yz-z-z---|';
        const values = { x: 10, y: 30, z: 50 };

        const result = e1.pipe(rxSwitchMap((x) => e2.pipe(map((i) => i * +x))));

        expectObservable(result).toBe(expected, values);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
      });
    });
  });

  it('should catch error and continue', () => {
    const sourceTrigger$ = createSourceTrigger();
    const source$ = sourceTrigger$.pipe(rxSwitchMap((value) => value));
    const error = createError();
    const result = subscribeSpyTo(source$);
    sourceTrigger$.next(of(1));
    sourceTrigger$.next(createErrorSource(error));
    sourceTrigger$.next(of(10));

    expect(result.getValues().length).toEqual(3);
    expect(result.getValues()).toEqual([1, error, 10]);
  });
});
