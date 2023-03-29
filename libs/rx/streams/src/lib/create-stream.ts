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

export interface Stream<T> {
  send: (val: T) => void;
  $: Observable<T>;
}

export interface StreamConfig<T> {
  filterNull?: boolean;
  shareCfg?: ShareConfig<T>;
}


// cfg throttleMs, filterNull, distinctComparatorFn, shareCfg
export function createStream<T>(): Stream<T>;
export function createStream<T>(cfg: StreamConfig<T>): Stream<T>;
export function createStream<T>(initialValue: T): Stream<T>
export function createStream<T>(initialValue: T, cfg: StreamConfig<T>): Stream<T>
export function createStream<T>(initialValueOrConfig?: T | StreamConfig<T>, cfg?: StreamConfig<T>): Stream<T> {
  const defaultShareCfg: ShareConfig<T> = {
    connector: () => new ReplaySubject(1),
    resetOnComplete: false,
    resetOnError: false,
    resetOnRefCountZero: false,
  };

  const initialvalue: T | undefined = !isStreamConfig(initialValueOrConfig) ? initialValueOrConfig as T : undefined;
  let config: StreamConfig<T> | undefined
  if(isStreamConfig(initialValueOrConfig)) {
    config = initialValueOrConfig;
  }else {
    if (isStreamConfig(cfg)) {
      config = cfg;
    } else {
      config = undefined;
    }
  }

  const signal: Subject<T> = initialvalue ? new BehaviorSubject<T>(initialvalue):  new ReplaySubject<T>(1);
  const $ = signal.asObservable() .pipe(
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
function isStreamConfig<T>(obj: any): obj is StreamConfig<T> {
  // eslint-disable-next-line no-prototype-builtins
  return obj?.hasOwnProperty("filterNull") || obj?.hasOwnProperty("shareCfg");
}


