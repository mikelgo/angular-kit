import {toSignal} from "@angular/core/rxjs-interop";
import {Signal} from "@angular/core";
import {RxStateful, RxStatefulContext, RxStatefulSignals, Stateful} from "../types/types";

/**
 * @internal
 */
export function createRxStatefulSignals<T,E>(rxStateful$: RxStateful<T, E>): RxStatefulSignals<T, E>{
  // todo check type assertions
  return {
    value: toSignal(rxStateful$.value$) as Signal<T | null | undefined>,
    hasValue: toSignal(rxStateful$.hasValue$) as Signal<boolean>,
    isSuspense: toSignal(rxStateful$.isSuspense$) as Signal<boolean>,
    hasError: toSignal(rxStateful$.hasError$) as Signal<boolean>,
    error: toSignal(rxStateful$.error$) as Signal<E | never>,
    context: toSignal(rxStateful$.context$) as Signal<RxStatefulContext>,
    state: toSignal(rxStateful$.state$) as Signal<Stateful<T, E>>,
  }
}
