import {
  AfterContentChecked,
  AfterContentInit,
  AfterViewChecked,
  AfterViewInit,
  Directive,
  DoCheck,
  OnDestroy,
  OnInit
} from '@angular/core';
import {distinctUntilChanged, Observable, ReplaySubject, Subject} from "rxjs";

/**
 * @publicApi
 *
 * @description
 * Use this directive as Host Dirtive to get a stream of lifecycle hooks.
 *
 * @example
 * @Component({
 * // ...
 * hostDirectives: [RxHooks$]
 * export class Component{
 *   private hooks$ = inject(RxHooks$);
 *
 *
 * }
 */
@Directive({
  selector: '[rxHooks]',
  standalone: true,
})
export class RxHooks$ implements OnInit, DoCheck, AfterViewInit, AfterViewChecked, AfterContentInit, AfterContentChecked, OnDestroy{
  #onConstruct$$ = new ReplaySubject<void>(1);
  #onInit$ = new ReplaySubject<void>(1);
  #doCheck$ = new ReplaySubject<void>(1);
  #afterContentInit$ = new ReplaySubject<void>(1);
  #afterContentChecked$ = new ReplaySubject<void>(1);
  #afterViewInit$ = new ReplaySubject<void>(1);
  #afterViewChecked$ = new ReplaySubject<void>(1);
  #onDestroy$ = new ReplaySubject<void>(1);

  /**
   * @publicApi
   * @description
   * Emits when the component or directive is constructed.
   */
  onConstruct$ = asObservable(this.#onConstruct$$);
  /**
   * @publicApi
   * @description
   * Emits when the component's or directive's ngOnInit is executed.
   */
  onInit$ = asObservable(this.#onInit$);
  /**
   * @publicApi
   * @description
   * Emits when the component's or directive's ngDoCheck is executed.
   */
  doCheck$ = asObservable(this.#doCheck$);
  /**
   * @publicApi
   * @description
   * Emits when the component's or directive's ngAfterContentInit is executed.
   */
  afterContentInit$ = asObservable(this.#afterContentInit$);
  /**
   * @publicApi
   * @description
   * Emits when the component's or directive's ngAfterContentChecked is executed.
   */
  afterContentChecked$ = asObservable(this.#afterContentChecked$);
  /**
   * @publicApi
   * @description
   * Emits when the component's or directive's ngAfterViewInit is executed.
   */
  afterViewInit$ = asObservable(this.#afterViewInit$);
  /**
   * @publicApi
   * @description
   * Emits when the component's or directive's ngAfterViewChecked is executed.
   */
  afterViewChecked$ = asObservable(this.#afterViewChecked$);
  /**
   * @publicApi
   * @description
   * Emits when the component's or directive's ngOnDestroy is executed.
   */
  onDestroy$ = asObservable(this.#onDestroy$);

  constructor() {
    this.#onConstruct$$.next(void 0)
  }

  ngOnInit(): void {
    this.#onInit$.next();
  }

  ngDoCheck(): void {
    this.#doCheck$.next();
  }

  ngAfterViewInit(): void {
    this.#afterViewInit$.next();
  }

  ngAfterViewChecked(): void {
    this.#afterViewChecked$.next();
  }

  ngAfterContentInit(): void {
    this.#afterContentInit$.next();
  }

  ngAfterContentChecked(): void {
    this.#afterContentChecked$.next();
  }

  ngOnDestroy(): void {
    this.#onDestroy$.next();
  }
}

function asObservable<T>(source: Subject<T>): Observable<T> {
  return source.asObservable().pipe(
    distinctUntilChanged()
  );
}
