export type ProjectStateReducerFn<T, V> = (state: T, value: V) => Partial<T>;
