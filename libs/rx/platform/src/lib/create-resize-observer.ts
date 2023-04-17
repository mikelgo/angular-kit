import {ElementRef} from '@angular/core';
import {debounceTime, distinctUntilChanged, Observable, SchedulerLike, shareReplay} from 'rxjs';
import {isElementRef} from "./utils/is-element-ref";

const DEFAULT_THROTTLE_TIME = 50;

export function supportsResizeObserver() {
  return typeof window.ResizeObserver !== 'undefined';
}

export type ResizeObserverConfig = {
  /**throttle emissions, defaults to 50*/
  throttleMs?: number;
  /** scheduler to use for throttling */
  scheduler?: SchedulerLike;
};

export function createResizeObserver(
  observeElement: ElementRef | Element,
  cfg?: ResizeObserverConfig
): Observable<ResizeObserverEntry[]> {
  if (!supportsResizeObserver()) {
    throw new Error('[AngularKit] ResizeObserver is not supported in this browser');
  }
  const obs$ = new Observable<ResizeObserverEntry[]>((subscriber) => {
    const resizeObserver = new ResizeObserver((entries) => {
      subscriber.next(entries);
    });

    resizeObserver.observe(isElementRef(observeElement) ? observeElement.nativeElement : observeElement);

    return () => resizeObserver.disconnect();
  });

  return obs$.pipe(
    distinctUntilChanged(),
    cfg?.throttleMs ? debounceTime(cfg?.throttleMs, cfg?.scheduler) : debounceTime(DEFAULT_THROTTLE_TIME),
    shareReplay({refCount: true, bufferSize: 1})
  );
}


