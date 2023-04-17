import {inject, Injectable} from "@angular/core";
import {TypedSimpleChanges} from "./effect-on-changes$";
import {BehaviorSubject, distinctUntilChanged, filter, Observable, ReplaySubject, scan, switchMap} from "rxjs";
import {mapChanges} from "./util/map-changes";

/**
 * @internal
 *
 * @description
 */
@Injectable()
class OnChanges<I extends Record<string, any>> {
  private readonly source$$ = new ReplaySubject<Partial<I>>(1)
  private readonly initialized$$ = new BehaviorSubject<boolean>(false)

  isInitialized$ = this.initialized$$.asObservable().pipe(
    distinctUntilChanged()
  );

  /**
   * @publicApi
   * Emits the changes
   */
  changes$: Observable<Partial<I>> = this.initialized$$.pipe(
    filter(initialized => !!initialized),
    switchMap(() => this.source$$),
    distinctUntilChanged((previous: I, current: I) => {
      const keys = Object.keys(current);
      return keys.every((key) => {
        return current[key] === previous[key];
      });
    })
  )


  /**
   * @publicApi
   * Emits the accumulated changes
   */
  changesState$: Observable<I> = this.initialized$$.pipe(
    filter(initialized => !!initialized),
    switchMap(() => this.source$$),
    scan((acc, curr) => ({...acc, ...curr}), {} as I),
    distinctUntilChanged((previous: I, current: I) => {
      const keys = Object.keys(current);
      return keys.every((key) => {
        return current[key] === previous[key];
      });
    })
  )

  /**
   * @publicApi
   * @description
   * Connects the changes to the state
   *
   * @example
   *  ngOnChanges(changes: TypedSimpleChanges<any>
   *  this.state.connect$(changes);
   *  }
   * @param changes
   */
  connect$<I>(changes: TypedSimpleChanges<I>){
    const value = mapChanges(changes);
    if (!this.initialized$$.getValue()){
      this.initialized$$.next(true);
    }

    // @ts-ignore
    this.source$$.next(value);

  }
}

export function provideOnChanges$<T extends Record<string, any>>(){
  return OnChanges<T>;
}

export function injectOnChanges$<T extends Record<string, any>>(){
  return inject(OnChanges<T>)
}

