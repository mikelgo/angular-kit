import {EventEmitter, inject, InjectionToken, InjectOptions, Provider} from '@angular/core';

import {BehaviorSubject} from "rxjs";

/* Common + Utility */
export type EquConfig = {
  /** Compare arrays by reference equality a === b (default), or by shallow equality */
  arrays?: 'reference' | 'shallow';
  /** Compare objects by reference equality a === b (default), or by shallow equality */
  objects?: 'reference' | 'shallow';
  /** If true the keys in both a and b must match 1:1 (default), if false a's keys must intersect b's */
  strict?: boolean;
};

export const is = {
  obj: (a: unknown): a is object => a === Object(a) && !is.arr(a) && typeof a !== 'function',
  ref: (a: unknown): a is Ref => !!a && a instanceof Ref,

  // eslint-disable-next-line @typescript-eslint/ban-types
  fun: (a: unknown): a is Function => typeof a === 'function',
  str: (a: unknown): a is string => typeof a === 'string',
  num: (a: unknown): a is number => typeof a === 'number',
  boo: (a: unknown): a is boolean => typeof a === 'boolean',
  und: (a: unknown) => a === void 0,
  eventEmitter: (a: unknown): a is EventEmitter<any> => a instanceof EventEmitter,
  arr: (a: unknown): a is Array<any> => Array.isArray(a),
  equ(a: any, b: any, { arrays = 'shallow', objects = 'reference', strict = true }: EquConfig = {}) {
    // Wrong type or one of the two undefined, doesn't match
    if (typeof a !== typeof b || !!a !== !!b) return false;
    // Atomic, just compare a against b
    if (is.str(a) || is.num(a)) return a === b;
    const isObj = is.obj(a);
    if (isObj && objects === 'reference') return a === b;
    const isArr = is.arr(a);
    if (isArr && arrays === 'reference') return a === b;
    // Array or Object, shallow compare first to see if it's a match
    if ((isArr || isObj) && a === b) return true;
    // Last resort, go through keys
    let i;
    for (i in a) if (!(i in b)) return false;
    for (i in strict ? b : a) if (a[i] !== b[i]) return false;
    if (is.und(i)) {
      if (isArr && a.length === 0 && b.length === 0) return true;
      if (isObj && Object.keys(a).length === 0 && Object.keys(b).length === 0) return true;
      if (a !== b) return false;
    }
    return true;
  },
};

export class Ref<TValue = any> extends BehaviorSubject<TValue> {
  constructor(value?: TValue | null) {
    super((value ? value : null) as TValue);
  }

  set(value: ((prev: TValue) => TValue) | TValue) {
    if (typeof value === 'function') {
      this.next((value as (prev: TValue) => TValue)(this.value));
    } else {
      this.next(value);
    }
  }
}

export type AnyFunction<TReturn = any> = (...args: any[]) => TReturn;
export type AnyConstructor<TObject = any> = new (...args: any[]) => TObject;
export type AnyAbstractConstructor<TObject = any> = abstract new (...args: any[]) => TObject;
export type AnyCtor<TObject = any> = AnyConstructor<TObject> | AnyAbstractConstructor<TObject>;

export function createNgtProvider(base: AnyCtor, ...providers: AnyFunction[]) {
  return (sub: AnyCtor) => {
    return [
      ...(providers || []).map((providerFn) => providerFn(sub)),
      {
        provide: base,
        useExisting: sub,
      },
    ];
  };
}

export function createInjection<
  TTokenValue,
  TProvideValue = TTokenValue extends object ? Partial<TTokenValue> : TTokenValue
  >(
  description: string,
  {
    defaultValueOrFactory,
    provideValueFactory,
  }: {
    defaultValueOrFactory?: TTokenValue | (() => TTokenValue);
    provideValueFactory?: (value: TProvideValue) => TTokenValue;
  } = {}
): [
  injectFn: (options?: InjectOptions) => TTokenValue,
  provideFn: (value: TProvideValue) => Provider,
  token: InjectionToken<TTokenValue>
] {
  const factory = (
    defaultValueOrFactory && typeof defaultValueOrFactory === 'function'
      ? defaultValueOrFactory
      : () => defaultValueOrFactory
  ) as () => TTokenValue;
  const injectionToken = new InjectionToken(description, { factory });

  function injectFn(options: InjectOptions = {}) {
    return inject(injectionToken, options) as TTokenValue;
  }

  function provideFn(value: TProvideValue): Provider {
    return {
      provide: injectionToken,
      useValue: provideValueFactory ? provideValueFactory(value) : value,
    };
  }

  return [injectFn, provideFn, injectionToken];
}

export function createRefInjection<
  TInstanceType extends object = any,
  TCtor extends AnyCtor<TInstanceType> = AnyCtor<TInstanceType>
  >(
  description: string,
  hostOrProviderFactory?: AnyFunction<Provider> | true,
  ...providersFactory: AnyFunction<Provider>[]
): [
  injectFn: (options?: InjectOptions) => AnyFunction<Ref<TInstanceType>>,
  providedFn: <TProvideCtor extends TCtor = TCtor>(
    sub: TProvideCtor,
    factory?: (instance: InstanceType<TProvideCtor>) => Ref
  ) => Provider,
  token: InjectionToken<AnyFunction<Ref<TInstanceType>>>
] {
  if (is.fun(hostOrProviderFactory)) {
    providersFactory = [hostOrProviderFactory, ...providersFactory];
  }

  const injectionToken = new InjectionToken(description);

  function injectFn(options: InjectOptions = {}) {
    return inject(injectionToken, options) as AnyFunction<Ref>;
  }

  function providedFn<TProvideCtor extends TCtor = TCtor>(
    sub: TProvideCtor,
    factory?: (instance: InstanceType<TProvideCtor>) => Ref
  ) {
    return [
      ...(providersFactory || []).map((providerFn) => providerFn(sub, factory)),
      {
        provide: injectionToken,
        useFactory: (instance: InstanceType<TProvideCtor>) => {
          if (factory) {
            return () => factory(instance);
          }

          if (is.boo(hostOrProviderFactory)) {
            return (instance as any)['parentRef'];
          }

          return () => (instance as any)['instance'];
        },
        deps: [sub],
      },
    ];
  }

  return [injectFn, providedFn, injectionToken];
}
