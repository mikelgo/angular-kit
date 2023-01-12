import {distinctUntilChanged, filter, Observable, ReplaySubject, share, ShareConfig} from 'rxjs';

export interface Signal<T> {
  send: (val: T) => void;
  $: Observable<T>;
}

export interface SignalConfig<T> {
  filterNull?: boolean;
  shareCfg?: ShareConfig<T>;
}

// cfg throttleMs, filterNull, distinctComparatorFn, shareCfg
export function createSignal<T>(cfg?: SignalConfig<T>): Signal<T> {
  const defaultShareCfg: ShareConfig<T> = {
    connector: () => new ReplaySubject(1),
    resetOnComplete: false,
    resetOnError: false,
    resetOnRefCountZero: false,
  };
  const signal = new ReplaySubject<T>(1);
  const $ = signal.asObservable().pipe(
    filter((v) => v !== undefined && (cfg?.filterNull ? v !== null : true)),
    distinctUntilChanged(),
    share(cfg?.shareCfg ?? defaultShareCfg)
  );

  return {
    send: (val) => signal.next(val),
    $,
  };
}
