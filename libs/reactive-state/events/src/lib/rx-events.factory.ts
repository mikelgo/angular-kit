import {Events, EventTransforms, RxEvents, ValuesOf} from './types';
import {ErrorHandler, inject, Injectable, OnDestroy} from '@angular/core';
import {eventProxyHandler} from './proxy';
import {Subject} from 'rxjs';

type SubjectMap<T> = { [K in keyof T]: Subject<T[K]> };

@Injectable()
export class RxEventsFactory<T extends Partial<Events>> implements OnDestroy {
  private subjects: SubjectMap<T>[] = [] as SubjectMap<T>[];
  private readonly errorHandler = inject(ErrorHandler, { optional: true })


  setup<U extends EventTransforms<T> = {}>(transforms?: U): RxEvents<T, U> {
    const subjects: SubjectMap<T> = {} as SubjectMap<T>;
    this.subjects.push(subjects);

    function signals(): void {}
    return new Proxy(
      signals as any as RxEvents<T, U>,
      eventProxyHandler(
        subjects as any as { [K in keyof T]: Subject<ValuesOf<T>> },
        transforms,
        this.errorHandler
      )
    ) as any as RxEvents<T, U>;
  }

  destroy() {
    this.subjects.forEach((s) => {
      Object.values(s).forEach((subject: any) => subject.complete());
    })
  }

  /**
   * @internal
   * Internally used to clean up potential subscriptions to the subjects. (For Actions it is most probably a rare case but still important to care about)
   */
  ngOnDestroy() {
    this.destroy();
  }
}
