import {RxStateful,} from '@angular-kit/rx-stateful';
import {BehaviorSubject, Observable, ReplaySubject, Subject} from "rxjs";

export interface RxStatefulMock<T, E = unknown> {
  instance: Observable<RxStateful<T, E>>
  state$Trigger: Subject<Partial<RxStateful<T, E>>>
}
export function mockRxStateful<T, E = unknown>(): RxStatefulMock<T, E> {
  function createTrigger<T>(startValue?: T | null | undefined){
    const trigger = startValue ? new BehaviorSubject(startValue) : new ReplaySubject<T>(1)
    return trigger;
  }

  const state$Trigger = createTrigger<Partial<RxStateful<T,  E>>>()
  const instance: Observable<RxStateful<T, E>> = state$Trigger.asObservable() as Observable<RxStateful<T,  E>>


  return {
    instance,
    state$Trigger
  } as RxStatefulMock<T, E>
}

