import {Observable} from "rxjs";
import {RxStatefulContext} from "./types";

// base types
interface RxStateful<T, E = unknown> {
    hasValue$: Observable<boolean>;
    hasError$: Observable<boolean>;
    context$: Observable<RxStatefulContext>;
}

interface Stateful<T, E= unknown> {
    hasError: boolean;
    hasValue: boolean;
    context: RxStatefulContext;
}

interface StatefulWithSuspense<T, E = unknown>extends Stateful<T,  E>{
    isSuspense: boolean;
}
interface RxStatefulWithSuspense<T, E = unknown> extends RxStateful<T,  E>{
    isSuspense$: Observable<boolean>;
    state$: Observable<StatefulWithSuspense<T, E>>
    // context is suspense
}

interface StatefulWithValue<T, E = unknown> extends Stateful<T, E>{
    value: T
}
interface RxStatefulWithValue<T, E = unknown> extends RxStateful<T,  E>{
    value$: Observable<T>;
    state$: Observable<StatefulWithValue<T, E>>
    // context is next
}

interface StatefulWithOptionalValue<T, E = unknown> extends Stateful<T, E>{
  value: T | null | undefined;
}

interface RxStatefulWithOptionalValue<T, E = unknown> extends RxStateful<T,  E>{
  value$: Observable<T | null | undefined>;
  state$: Observable<StatefulWithOptionalValue<T, E>>
  // context is next
}
interface StatefulWithError<T,E=unknown> extends Stateful<T, E> {
    error: E | never;
}
interface RxStatefulWithError<T, E = unknown> extends RxStateful<T, E>{
    error$: Observable<E | never>;
    state$: Observable<StatefulWithError<T, E>>
    // context is error
}
