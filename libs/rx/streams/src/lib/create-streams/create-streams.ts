import {RxStreams, Streams, StreamTransformation, ValuesOf} from './types';
import {actionProxyHandler} from './proxy';
import {Subject} from 'rxjs';

type SubjectMap<T> = { [K in keyof T]: Subject<T[K]> };

// todo docs
// todo apply distinctUntilChanged, share, filter etc?
export function createStreams<T extends Partial<Streams>, U extends StreamTransformation<T> = object>(transforms?: U): RxStreams<T, U> {
  const subjectMap: SubjectMap<T>[] = [] as SubjectMap<T>[];

  const subjects: SubjectMap<T> = {} as SubjectMap<T>;
  subjectMap.push(subjects);

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  function signals(): void {}
  return new Proxy(
    signals as any as RxStreams<T, U>,
    actionProxyHandler(subjects as any as { [K in keyof T]: Subject<ValuesOf<T>> }, transforms)
  ) as any as RxStreams<T, U>;
}




