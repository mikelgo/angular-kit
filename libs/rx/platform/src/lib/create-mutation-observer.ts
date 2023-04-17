import {debounceTime, Observable, SchedulerLike, shareReplay} from 'rxjs';
import {ElementRef} from '@angular/core';
import {isElementRef} from "./utils/is-element-ref";

const DEFAULT_THROTTLE_TIME = 50;

export function supportsMutationObserver() {
  return typeof window.MutationObserver !== 'undefined';
}

export type MutationObserverConfig = {
  /**throttle emissions, defaults to 50*/
  throttleMs?: number;
  /** scheduler to use for throttling */
  scheduler?: SchedulerLike;
}

export function createMutationObserver(
  observeElement: ElementRef | Element,
  options?: MutationObserverInit,
  cfg?: MutationObserverConfig
): Observable<MutationRecord[]> {
  if (!supportsMutationObserver()) {
    throw new Error('[AngularKit] MutationObserver is not supported in this browser');
  }
  const obs$ = new Observable<MutationRecord[]>((subscriber) => {
    const mutationObserver = new MutationObserver((entries) => {
      subscriber.next(entries);
    });

    mutationObserver.observe(isElementRef(observeElement) ? observeElement.nativeElement : observeElement, options ?? {});

    return () => mutationObserver.disconnect();
  });

  return obs$.pipe(
    cfg?.throttleMs ? debounceTime(cfg?.throttleMs, cfg?.scheduler) : debounceTime(DEFAULT_THROTTLE_TIME),
    shareReplay({refCount: true, bufferSize: 1})
  );
}
