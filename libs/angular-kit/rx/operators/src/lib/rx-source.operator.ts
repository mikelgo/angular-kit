import {
  distinctUntilChanged,
  filter,
  map,
  noop,
  Observable,
  of,
  OperatorFunction,
  ReplaySubject,
  share,
  UnaryFunction
} from "rxjs";

// todo überarbeiten
export function isOperateFnArrayGuard<T, R = T>(
  op: any[]
): op is OperatorFunction<T, R>[] {
  if (!Array.isArray(op)) {
    return false;
  }
  return op.length > 0 && op.every((i: any) => typeof i === 'function');
}


export type NonUndefined<T> = T extends undefined ? never : T;
export function pipeFromArray<T, R>(
  fns: Array<UnaryFunction<T, R>>
): UnaryFunction<T, R> {
  if (!fns) {
    return noop as UnaryFunction<any, any>;
  }

  if (fns.length === 1) {
    return fns[0];
  }

  return function piped(input: T): R {
    return fns.reduce(
      (prev: any, fn: UnaryFunction<T, R>) => fn(prev),
      input as any
    );
  };
}


export function rxWrap<T, R>(
  ...optionalDerive: OperatorFunction<T, R>[]
): OperatorFunction<T, NonUndefined<T> | NonUndefined<R>> {
  return (s: Observable<T>): Observable<NonUndefined<T> | NonUndefined<R>> => {
    return s.pipe(
      // distinct same base-state objects (e.g. a default emission of default switch cases, incorrect mutable handling
      // of data) @TODO evaluate benefits vs. overhead
      distinctUntilChanged(),
      // CUSTOM LOGIC HERE
      (o: Observable<T>): Observable<T | R> => {
        if (isOperateFnArrayGuard(optionalDerive)) {
          // @ts-ignore
          return o.pipe(pipeFromArray(optionalDerive));
        }
        return o;
      },
      // initial emissions, undefined is no base-state, pollution with skip(1)
      filter((v): v is NonUndefined<typeof v> => v !== undefined),
      // distinct same derivation value
      distinctUntilChanged(),
      // reuse custom operations result for multiple subscribers and reemit the last calculated value.
      share({ connector: () => new ReplaySubject(1) })
    );
  };
}

const test = of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10).pipe(
  rxWrap(
    map(state => state * 2),
    map(state => state * 2),

  )
);
