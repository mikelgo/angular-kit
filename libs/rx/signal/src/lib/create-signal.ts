import {
  BehaviorSubject,
  distinctUntilChanged,
  filter,
  Observable,
  ReplaySubject,
  share,
  ShareConfig,
  Subject
} from 'rxjs';

export interface Signal<T> {
  send: (val: T) => void;
  $: Observable<T>;
}

export interface SignalConfig<T> {
  filterNull?: boolean;
  shareCfg?: ShareConfig<T>;
}


// cfg throttleMs, filterNull, distinctComparatorFn, shareCfg
export function createSignal<T>(): Signal<T>;
export function createSignal<T>(cfg: SignalConfig<T>): Signal<T>;
export function createSignal<T>(initialValue: T): Signal<T>
export function createSignal<T>(initialValue: T, cfg: SignalConfig<T>): Signal<T>
export function createSignal<T>(initialValueOrConfig?: T | SignalConfig<T>, cfg?: SignalConfig<T>): Signal<T> {
  const defaultShareCfg: ShareConfig<T> = {
    connector: () => new ReplaySubject(1),
    resetOnComplete: false,
    resetOnError: false,
    resetOnRefCountZero: false,
  };

  const initialvalue: T | undefined = !isSignalConfig(initialValueOrConfig) ? initialValueOrConfig as T : undefined;
  let config: SignalConfig<T> | undefined
  if(isSignalConfig(initialValueOrConfig)) {
    config = initialValueOrConfig;
  }else {
    if (isSignalConfig(cfg)) {
      config = cfg;
    } else {
      config = undefined;
    }
  }

  const signal: Subject<T> = initialvalue ? new BehaviorSubject<T>(initialvalue):  new ReplaySubject<T>(1);
  const $ = (signal.asObservable() as Observable<T>).pipe(
    filter((v) => v !== undefined && (config?.filterNull ? v !== null : true)),
    distinctUntilChanged(),
    share(config?.shareCfg ?? defaultShareCfg)
  );

  return {
    send: (val) => signal.next(val),
    $,
  };
}

// type guard for SignalConfig<T>
function isSignalConfig<T>(obj: any): obj is SignalConfig<T> {
  // eslint-disable-next-line no-prototype-builtins
  return obj?.hasOwnProperty("filterNull") || obj?.hasOwnProperty("shareCfg");
}


