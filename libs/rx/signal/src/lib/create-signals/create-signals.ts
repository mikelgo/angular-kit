import {RxSignals, Signals, SignalTransformation, ValuesOf} from './types';
import {actionProxyHandler} from './proxy';
import {Subject} from 'rxjs';

type SubjectMap<T> = { [K in keyof T]: Subject<T[K]> };

// todo docs
// todo apply distinctUntilChanged, share, filter etc?
export function createSignals<T extends Partial<Signals>, U extends SignalTransformation<T> = object>(transforms?: U): RxSignals<T, U> {
  const subjectMap: SubjectMap<T>[] = [] as SubjectMap<T>[];

  const subjects: SubjectMap<T> = {} as SubjectMap<T>;
  subjectMap.push(subjects);

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  function signals(): void {}
  return new Proxy(
    signals as any as RxSignals<T, U>,
    actionProxyHandler(subjects as any as { [K in keyof T]: Subject<ValuesOf<T>> }, transforms)
  ) as any as RxSignals<T, U>;
}




