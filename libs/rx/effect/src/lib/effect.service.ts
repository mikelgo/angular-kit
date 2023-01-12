import {ErrorHandler, Injectable, OnDestroy} from '@angular/core';
import {catchError, EMPTY, Observable, Subscription, tap} from 'rxjs';

/**
 * Keeps track of your subscriptions and unsubscribes them automatically when destroyed.
 *
 * @example
 */
@Injectable()
export class Effect implements OnDestroy {
  private readonly sub = new Subscription();

  constructor(private readonly e: ErrorHandler) {}

  /**
   *
   * @example
   * ```typescript
   * keeper.register(of(1).subscribe(console.log));
   * ```
   */
  run(sub: Subscription): void;
  /**
   *
   * @example
   * ```typescript
   * keeper.register(of(1).pipe(tap(console.log)));
   * ```
   */
  run(o$: Observable<unknown>): void;
  /**
   *
   * @example
   * ```typescript
   * const trigger$ = of(1);
   * const effect = console.log;
   * keeper.register(trigger$, effect);
   * ```
   */
  run(o$: Observable<unknown>, operation: (v: unknown) => void): void;
  run(obsOrSub$: Observable<unknown> | Subscription, operation?: (v: unknown) => void): void {
    if (obsOrSub$ instanceof Subscription) {
      this.sub.add(obsOrSub$);
      return;
    }
    this.sub.add(
      obsOrSub$
        .pipe(
          // execute operation/ side effect
          tap(operation),
          catchError((err) => {
            this.e.handleError(err);
            return EMPTY;
          })
        )
        .subscribe()
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
