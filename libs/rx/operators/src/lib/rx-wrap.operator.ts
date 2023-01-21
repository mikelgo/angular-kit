import {
  distinctUntilChanged,
  filter,
  noop,
  Observable,
  OperatorFunction,
  ReplaySubject,
  share,
  UnaryFunction,
} from 'rxjs';


export function isOperateFnArrayGuard<T, R = T>(op: any[]): op is OperatorFunction<T, R>[] {
  if (!Array.isArray(op)) {
    return false;
  }
  return op.length > 0 && op.every((i: any) => typeof i === 'function');
}

export type NonUndefined<T> = T extends undefined ? never : T;
export function pipeFromArray<T, R>(fns: Array<UnaryFunction<T, R>>): UnaryFunction<T, R> {
  if (!fns) {
    return noop as UnaryFunction<any, any>;
  }

  if (fns.length === 1) {
    return fns[0];
  }

  return function piped(input: T): R {
    return fns.reduce((prev: any, fn: UnaryFunction<T, R>) => fn(prev), input as any);
  };
}

export function rxWrap<T, R>(
  ...optionalDerive: OperatorFunction<T, R>[]
): OperatorFunction<T, NonUndefined<T> | NonUndefined<R>> {
  return (s: Observable<T>): Observable<NonUndefined<T> | NonUndefined<R>> => {
    return s.pipe(
      distinctUntilChanged(),
      // users operator
      (o: Observable<T>): Observable<T | R> => {
        if (isOperateFnArrayGuard(optionalDerive)) {
          return o.pipe(pipeFromArray(optionalDerive));
        }
        return o;
      },
      filter((v): v is NonUndefined<typeof v> => v !== undefined),
      distinctUntilChanged(),
      // reuse custom operations result for multiple subscribers and reemit the last calculated value.
      share({ connector: () => new ReplaySubject(1) })
    );
  };
}
