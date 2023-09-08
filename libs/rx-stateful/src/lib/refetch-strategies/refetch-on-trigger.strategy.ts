import {Observable, OperatorFunction, Subject, takeUntil} from 'rxjs';
import {refetchFnFactory, TriggerRefetchStrategy} from './refetch-strategy';
import {isObservableOrSubject} from './refetch-on-auto.strategy';

export type RefetchTrigger = {
  trigger: Observable<any> | Subject<any>;
  teardown: Observable<any> | Subject<any> | OperatorFunction<any, any>;
};

/**
 * Creates a refetch strategy that will refetch the data when the trigger emits.
 *
 * @example
 * const trigger = new Subject();
 * withRefetchOnTrigger(trigger);
 */
export function withRefetchOnTrigger<T>(triggerSource: Observable<T>| Subject<T>): TriggerRefetchStrategy;
/**
 * Creates a refetch strategy that will refetch the data when the trigger emits.
 * Additionally it will teardown the trigger when the teardown emits.
 *
 * @example
 * const trigger = new Subject();
 * const teardown = new Subject();
 * withRefetchOnTrigger({trigger, teardown});
 */
export function withRefetchOnTrigger<T>(triggerSource: RefetchTrigger): TriggerRefetchStrategy;
export function withRefetchOnTrigger<T>(triggerSource: Observable<T> | Subject<T> | RefetchTrigger): TriggerRefetchStrategy{
  if (isObservableOrSubject(triggerSource)) {
    return {
      kind: 'trigger__rxStateful',
      refetchFn: refetchFnFactory(triggerSource),
    };
  }

  const { trigger, teardown } = triggerSource;
  if (isObservableOrSubject(teardown)) {
    return {
      kind: 'trigger__rxStateful',
      refetchFn: refetchFnFactory(trigger.pipe(takeUntil(teardown))),
    };
  } else {
    return {
      kind: 'trigger__rxStateful',
      refetchFn: refetchFnFactory(trigger.pipe(teardown)),
    };
  }
}


function isTriggerGuard(arg: any): arg is RefetchTrigger {
  return arg && !!arg?.trigger && !!arg?.teardown;
}

