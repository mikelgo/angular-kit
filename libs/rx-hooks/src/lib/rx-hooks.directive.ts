import {
  AfterContentChecked,
  AfterContentInit,
  AfterViewChecked,
  AfterViewInit,
  Directive,
  DoCheck,
  OnDestroy,
  OnInit,
  Output
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
  private readonly onCreation$$ = new ReplaySubject<void>(1);
  private readonly onInit$$ = new ReplaySubject<void>(1);
  private readonly doCheck$$ = new ReplaySubject<void>(1);
  private readonly afterContentInit$$ = new ReplaySubject<void>(1);
  private readonly afterContentChecked$$ = new ReplaySubject<void>(1);
  private readonly afterViewInit$$ = new ReplaySubject<void>(1);
  private readonly afterViewChecked$$ = new ReplaySubject<void>(1);
  private readonly onDestroy$$ = new ReplaySubject<void>(1);

  /**
   * @publicApi
   * @description
   * Emits when the component or directive host is constructed.
   */
  readonly onCreation$ = asObservable(this.onCreation$$);
  /**
   * @publicApi
   * @description
   * Emits when the component's or directive's host ngOnInit is executed.
   */
  readonly onInit$ = asObservable(this.onInit$$);
  /**
   * @publicApi
   * @description
   * Emits when the component's or directive's host ngDoCheck is executed.
   *
   * Use this hook with caution as it will run after each change detection cycle
   */
  readonly doCheck$ = asObservable(this.doCheck$$);
  /**
   * @publicApi
   * @description
   * Emits when the component's or directive's host ngAfterContentInit is executed.
   */
  readonly afterContentInit$ = asObservable(this.afterContentInit$$);
  /**
   * @publicApi
   * @description
   * Emits when the component's or directive's host ngAfterContentChecked is executed.
   */
  readonly afterContentChecked$ = asObservable(this.afterContentChecked$$);
  /**
   * @publicApi
   * @description
   * Emits when the component's or directive's host ngAfterViewInit is executed.
   */
  readonly afterViewInit$ = asObservable(this.afterViewInit$$);
  /**
   * @publicApi
   * @description
   * Emits when the component's or directive's host ngAfterViewChecked is executed.
   */
  readonly afterViewChecked$ = asObservable(this.afterViewChecked$$);
  /**
   * @publicApi
   * @description
   * Emits when the component's or directive's host ngOnDestroy is executed.
   */
  readonly onDestroy$ = asObservable(this.onDestroy$$);

  /**
   * @publicApi
   * @description
   * Emits when the component or directive host is constructed.
   *
   * @example
   * <div rxHooks (created)="onDivCreated($event)"> ... </div>
   */
  @Output() created = this.onCreation$;
  /**
   * @publicApi
   * @description
   * Emits when the component's or directive's host ngOnInit is executed.
   *
   * @example
   * <div rxHooks (init)="onDivInit($event)"> ... </div>
   */
  @Output() init = this.onInit$;
  /**
   * @publicApi
   * @description
   * Emits when the component's or directive's host ngDoCheck is executed.
   *
   * Use this hook with caution as it will run after each change detection cycle
   *
   * @example
   * <div rxHooks (doCheck)="onDivChecked($event)"> ... </div>
   */
  @Output() doCheck = this.doCheck$;
  /**
   * @publicApi
   * @description
   * Emits when the component's or directive's host ngAfterContentInit is executed.
   *
   * @example
   * <div rxHooks (afterContentInit)="onDivContentInit($event)"> ... </div>
   */
  @Output() afterContentInit = this.afterContentInit$;
  /**
   * @publicApi
   * @description
   * Emits when the component's or directive's host ngAfterContentChecked is executed.
   *
   * @example
   * <div rxHooks (afterContentChecked)="onDivContentChecked($event)"> ... </div>
   */
  @Output() afterContentChecked = this.afterContentChecked$;
  /**
   * @publicApi
   * @description
   * Emits when the component's or directive's host ngAfterViewInit is executed.
   *
   * @example
   * <div rxHooks (afterViewInit)="onDivAfterViewInit($event)"> ... </div>
   */
  @Output() afterViewInit = this.afterViewInit$;
  /**
   * @publicApi
   * @description
   * Emits when the component's or directive's host ngAfterViewChecked is executed.
   *
   * @example
   * <div rxHooks (afterViewChecked)="onDivAfterViewChecked($event)"> ... </div>
   */
  @Output() afterViewChecked = this.afterViewChecked$;
  /**
   * @publicApi
   * @description
   * Emits when the component's or directive's host ngOnDestroy is executed.
   *
   * @example
   * <div rxHooks (destroy)="onDivDestroyed($event)"> ... </div>
   */
  @Output() destroy = this.onDestroy$;

  constructor() {
    this.onCreation$$.next(void 0);
    this.onCreation$$.complete();
  }

  ngOnInit(): void {
    this.onInit$$.next();
    this.onInit$$.complete();
  }

  ngDoCheck(): void {
    this.doCheck$$.next();
  }

  ngAfterViewInit(): void {
    this.afterViewInit$$.next();
    this.afterViewInit$$.complete();
  }

  ngAfterViewChecked(): void {
    this.afterViewChecked$$.next();
  }

  ngAfterContentInit(): void {
    this.afterContentInit$$.next();
    this.afterContentInit$$.complete();
  }

  ngAfterContentChecked(): void {
    this.afterContentChecked$$.next();
  }

  ngOnDestroy(): void {
    this.onDestroy$$.next();
    this.onDestroy$$.complete();
  }
}

function asObservable<T>(source: Subject<T>): Observable<T> {
  return source.asObservable().pipe(
    distinctUntilChanged()
  );
}
