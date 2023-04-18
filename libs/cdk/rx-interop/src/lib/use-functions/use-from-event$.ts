import {ElementRef, inject, NgZone} from "@angular/core";
import {distinctUntilChanged, fromEvent, Observable, ReplaySubject, takeUntil} from "rxjs";
import {useOnDestroy} from "./use-host-listener$";


/**
 *
 * @publicApi
 *
 * @description
 * Use this function to create a stream of events from an element.
 * By default the host listener runs outside of Angular's zone.
 *
 * @example
 * const element = inject(ElementRef)
 * const click$ = useFromEvent(this.element, 'click');
 *
 * click$.subscribe(() => { // do something });
 *
 * @param eventName
 */
export function useFromEvent$<T extends Event>(element: HTMLElement,eventName: string): Observable<T>
export function useFromEvent$<T extends Event>(elementRef: ElementRef,eventName: string): Observable<T>
export function useFromEvent$<T extends Event>(elementOrRef: HTMLElement | ElementRef,eventName: string): Observable<T>{
  const ngZone = inject(NgZone);
  const events$ = new ReplaySubject<T>(1);

  const el = elementOrRef instanceof ElementRef ? elementOrRef?.nativeElement : elementOrRef;

  ngZone.runOutsideAngular(() => {
    fromEvent<T>(el, eventName)
      .pipe(
        takeUntil(useOnDestroy())
      )
      .subscribe(value =>
        events$.next(value)
      );
  })

  return events$.asObservable().pipe(
    distinctUntilChanged()
  );
}

