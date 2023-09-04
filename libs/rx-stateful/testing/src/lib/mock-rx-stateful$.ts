import {RxStateful, RxStatefulContext, Stateful} from '@angular-kit/rx-stateful'
import {BehaviorSubject, ReplaySubject} from "rxjs";

export function mockRxStateful<T, E = unknown>(startValues?: {
  value?: T | undefined | null;
  hasError?: boolean;
  hasValue?: boolean;
  context?: RxStatefulContext
  isSuspense?: boolean;
  error?: E;
  state?: Stateful<T, E>
}) {
  function createTrigger<T>(startValue?: T | null){
    const trigger = startValue ? new BehaviorSubject(startValue) : new ReplaySubject<T>(1)
    return trigger;
  }
  const hasError$Trigger = createTrigger<boolean>(startValues?.hasError)
  const hasValue$Trigger = createTrigger<boolean>(startValues?.hasValue)
  const context$Trigger = createTrigger<RxStatefulContext>(startValues?.context)
  const value$Trigger = createTrigger<T>(startValues?.value)
  const isSuspense$Trigger = createTrigger<boolean>(startValues?.isSuspense)
  const error$Trigger = createTrigger<E>(startValues?.error)
  const state$Trigger = createTrigger<Stateful<T,  E>>(startValues?.state)
  const instance: RxStateful<T, E> = {
    hasError$: hasError$Trigger.asObservable(),
    hasValue$: hasValue$Trigger.asObservable(),
    context$: context$Trigger.asObservable(),
    value$: value$Trigger.asObservable(),
    isSuspense$: isSuspense$Trigger.asObservable(),
    error$: error$Trigger.asObservable(),
    state$: state$Trigger.asObservable(),
  }

  return {
    instance,
    hasError$Trigger,
    hasValue$Trigger,
    context$Trigger,
    value$Trigger,
    isSuspense$Trigger,
    error$Trigger,
    state$Trigger
  }
}

