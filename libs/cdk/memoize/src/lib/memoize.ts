/**
 * Memoize decorator
 * @example
 *
 * class Test {
  @Memoize()
  calculate(a: number, b: number): number {
    return a + b;
  }
}
 */
export function Memoize() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    //wrapping the original method
    descriptor.value = function (...args: any[]) {
      const memoizer = memoize(originalMethod);
      return memoizer.memoized(...args);
    };
  };
}

/**
 * Memoize a pure function and only recalculate if the arguments change.
 * @param projectionFn - the function to memoize
 * @param comparatorFn - a function to compare the arguments. By default an equality check (===) is used.
 *
 * @example
 * const memoizedFn = memoize((a, b) => a + b).memoized(a, b);
 */
export function memoize<T>(
  projectionFn: ProjectionFn<T>,
  comparatorFn?: ComparatorFn
): MemoizedProjection<T> {
  return resultMemoize(projectionFn, comparatorFn ?? defaultComparatorFn);
}

export type ProjectionFn<T> = (...args: any[]) => T;

export type ComparatorFn = (a: any, b: any) => boolean;

export type MemoizedProjection<T> = {
  memoized: ProjectionFn<T>;
  reset: () => void;
  setResult: (result?: T) => void;
};

function defaultComparatorFn(a: any, b: any): boolean {
  if (a instanceof Array) {
    return a.length === b.length && a.every((fromA) => b.includes(fromA));
  }
  // Default comparison
  return a === b;
}

export function isEqualCheck(a: any, b: any): boolean {
  return a === b;
}

function isArgumentsChanged(
  args: IArguments,
  lastArguments: IArguments,
  comparator: ComparatorFn
) {
  for (let i = 0; i < args.length; i++) {
    if (!comparator(args[i], lastArguments[i])) {
      return true;
    }
  }
  return false;
}

function resultMemoize<T>(
  projectionFn: ProjectionFn<T>,
  isResultEqual: ComparatorFn
) {
  return defaultMemoize(projectionFn, isEqualCheck, isResultEqual);
}

function defaultMemoize<T>(
  projectionFn: ProjectionFn<T>,
  isArgumentsEqual = isEqualCheck,
  isResultEqual = isEqualCheck
): MemoizedProjection<T> {
  let lastArguments: null | IArguments = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, , , , ,
  let lastResult: any = null;
  let overrideResult: any;

  function reset() {
    lastArguments = null;
    lastResult = null;
    overrideResult = undefined;
  }

  function setResult(result: any = undefined) {
    overrideResult = { result };
  }

  /* eslint-disable prefer-rest-params, prefer-spread */

  // disabled because of the use of `arguments`
  function memoized(): any {
    if (overrideResult !== undefined) {
      return overrideResult.result;
    }

    if (!lastArguments) {
      lastResult = projectionFn.apply(null, arguments as any);
      lastArguments = arguments;
      return lastResult;
    }

    if (!isArgumentsChanged(arguments, lastArguments, isArgumentsEqual)) {
      return lastResult;
    }

    const newResult = projectionFn.apply(null, arguments as any);
    lastArguments = arguments;

    if (isResultEqual(lastResult, newResult)) {
      return lastResult;
    }

    lastResult = newResult;

    return newResult;
  }

  return { memoized, reset, setResult };
}
