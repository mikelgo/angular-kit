import { ElementRef } from '@angular/core';
import { debounceTime, distinctUntilChanged, Observable, ReplaySubject, SchedulerLike, share } from 'rxjs';

const DEFAULT_THROTTLE_TIME = 125;

export function supportsResizeObserver() {
  return typeof window.ResizeObserver !== 'undefined';
}

export function createResizeObserver(
  observeElement: ElementRef,
  cfg?: {
    throttleMs?: number;
    scheduler?: SchedulerLike;
  }
): Observable<ResizeObserverEntry[]> {
  if (!supportsResizeObserver()) {
    throw new Error('[AngularKit] ResizeObserver is not supported in this browser');
  }
  const obs$ = new Observable<ResizeObserverEntry[]>((subscriber) => {
    const resizeObserver = new ResizeObserver((entries) => {
      subscriber.next(entries);
    });

    resizeObserver.observe(observeElement.nativeElement);

    return () => resizeObserver.disconnect();
  });

  return obs$.pipe(
    distinctUntilChanged(),
    cfg?.throttleMs ? debounceTime(cfg?.throttleMs, cfg?.scheduler) : debounceTime(DEFAULT_THROTTLE_TIME),
    share({
      connector: () => new ReplaySubject(1),
      resetOnComplete: false,
      resetOnError: false,
      resetOnRefCountZero: false,
    })
  );
}
