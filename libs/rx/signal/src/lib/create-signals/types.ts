import {Observable} from 'rxjs';

export type ValuesOf<O> = O[keyof O];
// type Keys = KeysOf<{ a: string, b: number }>; // "a" | "b"
export type KeysOf<O> = keyof O;

// class vs instance
type InstanceOrType<T> = T extends abstract new (...args: any) => infer R ? R : T;

// We infer all arguments instead of just the first one as we are more flexible for later changes
type InferArguments<T> = T extends (...args: infer R) => any ? R : never;

// It helps to infer the type of an objects key
// We have to use it because using just U[K] directly would
type Select<U, K> = K extends keyof U ? U[K] : never;

type ExtractString<T extends object> = Extract<keyof T, string>;

// Helper to get either the params of the transform function, or if the function is not present a fallback type
type FunctionParamsOrValueType<U, K, F> = InferArguments<Select<U, K>> extends never
  ? [F]
  : InferArguments<Select<U, K>>;

export type Signals = {};

// eslint-disable-next-line @typescript-eslint/ban-types
export type SignalTransformation<T extends {}> = Partial<{
  [K in keyof T]: (...args: any[]) => T[K];
}>;

export type SignalDispatchFn<O extends unknown[]> = (
  ...value: InstanceOrType<O>
) => void;

// eslint-disable-next-line @typescript-eslint/ban-types
export type SignalDispatchers<T extends Signals, U extends {}> = {
  [K in keyof T]: SignalDispatchFn<FunctionParamsOrValueType<U, K, Select<T, K>>>;
};

export type SignalObservables<T extends Signals> = {
  [K in ExtractString<T> as `${K}$`]: Observable<InstanceOrType<T[K]>>;
};

// eslint-disable-next-line @typescript-eslint/ban-types
export type RxSignals<T extends Signals, U extends {} = T> = SignalDispatchers<T, U> &
  SignalObservables<T> &
  ((slice: Partial<T>) => void) &
  {$:(props: (keyof T)[]) => Observable<ValuesOf<T>>};
