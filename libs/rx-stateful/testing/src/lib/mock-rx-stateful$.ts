import {RxStateful, RxStatefulContext, Stateful} from '@angular-kit/rx-stateful';
import {BehaviorSubject, map, merge, Observable, ReplaySubject, Subject} from "rxjs";

export interface RxStatefulMock<T, E> {
  hasError$Trigger: Subject<boolean>
  error$Trigger: Subject<E>
  isSuspense$Trigger: Subject<boolean>
  instance: RxStateful<T, E>;
  context$Trigger: Subject<RxStatefulContext>
  value$Trigger: Subject<T>
  hasValue$Trigger: Subject<boolean>
  state$Trigger: Subject<Partial<Stateful<T, E>>>
}
export function mockRxStateful<T, E = unknown>(): RxStatefulMock<T, E> {
  function createTrigger<T>(startValue?: T | null | undefined){
    const trigger = startValue ? new BehaviorSubject(startValue) : new ReplaySubject<T>(1)
    return trigger;
  }

  const hasError$Trigger = createTrigger<boolean>()
  const hasValue$Trigger = createTrigger<boolean>()
  const context$Trigger = createTrigger<RxStatefulContext>()
  const value$Trigger = createTrigger<T>()
  const isSuspense$Trigger = createTrigger<boolean>()
  const error$Trigger = createTrigger<E>()
  const state$Trigger = createTrigger<Partial<Stateful<T,  E>>>()
  const instance: RxStateful<T, E> = {
    hasError$: merge(hasError$Trigger.asObservable(),state$Trigger.pipe(map(v => v.hasError))) as Observable<boolean>,
    hasValue$: merge(hasValue$Trigger.asObservable(), state$Trigger.pipe(map(v => v.hasValue))) as Observable<boolean>,
    context$: merge(context$Trigger.asObservable(),  state$Trigger.pipe(map(v => v.context))) as Observable<RxStatefulContext>,
    value$: merge(value$Trigger.asObservable(),  state$Trigger.pipe(map(v => v.value))) as Observable<T>,
    isSuspense$: merge(isSuspense$Trigger.asObservable(), state$Trigger.pipe(map(v => v.isSuspense))) as Observable<boolean>,
    error$: merge(error$Trigger.asObservable(), state$Trigger.pipe(map(v => v.error))) as Observable<E> as Observable<E>,
    state$: state$Trigger.asObservable() as Observable<Stateful<T,  E>>,
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
  } as RxStatefulMock<T, E>
}

