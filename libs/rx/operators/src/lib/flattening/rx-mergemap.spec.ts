import {of} from 'rxjs';
import {subscribeSpyTo} from '@hirez_io/observer-spy';
import {rxMergeMap} from './rx-mergemap';
import {createError, createErrorSource, createSourceTrigger} from '@test-helpers';

describe('rxMergeMap', () => {
  it('should catch error and continue', () => {
    const sourceTrigger$ = createSourceTrigger();
    const source$ = sourceTrigger$.pipe(rxMergeMap((value) => value));
    const error = createError();
    const result = subscribeSpyTo(source$);
    sourceTrigger$.next(of(1));
    sourceTrigger$.next(createErrorSource(error));
    sourceTrigger$.next(of(10));

    expect(result.getValues().length).toEqual(3);
    expect(result.getValues()).toEqual([1, error, 10]);
  });
});
