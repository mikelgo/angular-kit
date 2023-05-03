import {ChangeDetectorRef, ElementRef, inject, NgZone, ViewRef} from '@angular/core';
import {distinctUntilChanged, fromEvent, Observable, ReplaySubject, takeUntil} from 'rxjs';

export interface UseHostListenerConfig {
  zoneless?: boolean;
}
/**
 *
 * @publicApi
 *
 * @description
 * Use this function to create a reactive host listener of the component where the listener is used.
 * By default the host listener runs outside of Angular's zone.
 *
 * @example
 *
 * const click$ = useHostListener$('click');
 *
 * click$.subscribe(() => { // do something });
 *
 * @param eventName
 */
export function useHostListener$<T extends Event>(eventName: string): Observable<T>;
export function useHostListener$<T extends Event>(eventName: string, cfg: UseHostListenerConfig): Observable<T>;
export function useHostListener$<T extends Event>(eventName: string, cfg?: UseHostListenerConfig): Observable<T> {
  const { nativeElement } = inject(ElementRef);
  const ngZone = inject(NgZone);
  const cdr = cfg?.zoneless ? undefined : inject(ChangeDetectorRef);

  const events$ = new ReplaySubject<T>(1);

  ngZone.runOutsideAngular(() => {
    fromEvent<T>(nativeElement, eventName)
      .pipe(takeUntil(useOnDestroy()))
      .subscribe((value) => {
        events$.next(value);
        cfg?.zoneless ? void 0 : cdr.detectChanges();
      });
  });

  return events$.asObservable().pipe(distinctUntilChanged());
}

/**
 * @internal
 * @description
 * helper
 */
export function useOnDestroy() {
  const onDestroy$ = new ReplaySubject<void>(1);
  const viewRef = inject(ChangeDetectorRef) as ViewRef;

  viewRef?.onDestroy(() => {
    onDestroy$.next(void 0);
    onDestroy$.complete();
  });

  return onDestroy$;
}
