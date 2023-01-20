// create marble tests for rxSwitchMap operator


import {rxSwitchMap} from "./rx-switchmap";
import {TestScheduler} from "rxjs/internal/testing/TestScheduler";
import {observableMatcher} from "@angular-kit/test-helpers";
import {map} from "rxjs";

describe('rxSwitchMap', () => {

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

  // todo
  /*describe('default error handling', () => {
    it('should catch and return the raised error', () => {
      testScheduler.run(({ hot, cold, expectObservable }) => {
        const e1 = hot('   --1-1--|');
        const e2 = cold('    y-x--|            ', { x: 10, y: 1 });
        //                         x-x-x|
        //                            x-x-x|
        const expected = ' --e-x--|';
        const values = { x: 10, e: 'error' };

        const result = e1.pipe(rxSwitchMap((x) => e2.pipe(map((i) => {
          if(i === 2) {
            throw ('error');
          }
          return i * +x
        }))));

        expectObservable(result).toBe(expected, values);
      });
    });
  });*/

})
