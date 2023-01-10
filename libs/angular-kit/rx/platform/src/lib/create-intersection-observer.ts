import { debounceTime, Observable, ReplaySubject, SchedulerLike, share } from 'rxjs';
import { ElementRef } from '@angular/core';

const DEFAULT_THROTTLE_TIME = 125;

export function supportsIntersectionObserver() {
  return typeof window.IntersectionObserver !== 'undefined';
}

export function createIntersectionObserver(
  observeElement: ElementRef,
  options?: IntersectionObserverInit,
  cfg?: {
    throttleMs?: number;
    scheduler?: SchedulerLike;
  }
): Observable<IntersectionObserverEntry[]> {
  if (!supportsIntersectionObserver()) {
    throw new Error('[AngularKit] IntersectionObserver is not supported in this browser');
  }
  const obs$ = new Observable<IntersectionObserverEntry[]>((subscriber) => {
    const intersectionObserver = new IntersectionObserver((entries) => {
      subscriber.next(entries);
    }, options ?? {});

    intersectionObserver.observe(observeElement.nativeElement);

    return () => intersectionObserver.disconnect();
  });

  return obs$.pipe(
    cfg?.throttleMs ? debounceTime(cfg?.throttleMs, cfg?.scheduler) : debounceTime(DEFAULT_THROTTLE_TIME),
    share({
      connector: () => new ReplaySubject(1),
      resetOnComplete: false,
      resetOnError: false,
      resetOnRefCountZero: false,
    })
  );
}
