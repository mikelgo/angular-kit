import {  ErrorHandler, inject, Injectable, OnDestroy,  } from '@angular/core';
import { catchError, EMPTY, Observable, ReplaySubject, Subscription, tap } from 'rxjs';

/**
 * Keeps track of your subscriptions and unsubscribes them automatically when destroyed.
 *
 */
@Injectable()
class RxEffects implements OnDestroy {
    private static nextId = 0;
    private readonly sub = new Subscription();
    private readonly idSubMap = new Map<number, Subscription>();
    private readonly destroyHook$$ = new ReplaySubject<void>(1);

    constructor(@Optional() private readonly errorHandler: ErrorHandler | null) {}

    /**
     *
     * @example
     * ```typescript
     * effects.register(of(1).subscribe(console.log));
     * ```
     */
    register(sub: Subscription): number;
    /**
     *
     * @example
     * ```typescript
     * effects.register(of(1).pipe(tap(console.log)));
     * ```
     */
    register<T>(o$: Observable<T>): number;
    /**
     *
     * @example
     * ```typescript
     * const trigger$ = of(1);
     * const effect = console.log;
     * effects.register(trigger$, effect);
     * ```
     */
    register<T>(o$: Observable<T>, sideEffectFn: (arg: T) => void): number;
    register<T>(obsOrSub$: Observable<T> | Subscription, sideEffectFn?: (arg: T) => void): number {
        const effectId = RxEffects.nextId++;
        if (obsOrSub$ instanceof Subscription) {
            this.sub.add(obsOrSub$);
            this.idSubMap.set(effectId, obsOrSub$);
            return effectId;
        }
        const subscription = obsOrSub$
            .pipe(
                // execute operation/ side effect
                tap(sideEffectFn),
                catchError(err => {
                    this.errorHandler?.handleError(err);
                    return EMPTY;
                })
            )
            .subscribe();
        this.sub.add(subscription);
        this.idSubMap.set(effectId, subscription);
        return effectId;
    }

    /**
     * Execute a sideEffect when the instance OnDestroy hook is executed
     * @param sideEffectFn
     */
    registerOnTeardown(sideEffectFn: () => void) {
        this.register(this.destroyHook$$.asObservable(), sideEffectFn);
    }

    /**
     * Cancel a registered side effect
     * @param effectId
     */
    unregister(effectId: number): void {
        const sub = this.idSubMap.get(effectId);
        if (sub) {
            sub.unsubscribe();
        }
    }

    ngOnDestroy(): void {
        this.destroyHook$$.next(void 0);
        this.sub.unsubscribe();
    }
}

type TeardownFn = (() => void) | void;
type ReactiveEffectsSetupFn = (
    rxEffect: Pick<RxEffects, 'register' | 'registerOnTeardown' | 'unregister'>
) => TeardownFn ;

type ReactiveEffectsTeardown = {
  /**
   * Unsubscribe from all registered effects and execute the teardown function
   * within the scope of the effects-instance
   */
  terminate: () => void
};

/**
 * A helper function to manage any RxJs subscription
 * @param setupFn
 *
 * @example
 *
 * const effects = reactiveEffects(({register}) => {
 *     register(source$, console.log)
 *
 *     register(source$.subscribe(console.log))
 *
 *     register(source$.pipe(tap(console.log)))
 *
 *     return () => {
 *         // any teardown logic, e.g unsubscribe from any source, clear timers etc.
 *     }
 * })
 */
export function reactiveEffects(setupFn: ReactiveEffectsSetupFn): ReactiveEffectsTeardown {
    // todo Angular-16 assertInInjectionContext(reactiveEffects);
    const errorHandler = inject(ErrorHandler, { optional: true });
    const effects = new RxEffects(errorHandler);

    const teardownFn = setupFn?.({
        register: effects.register.bind(effects),
        registerOnTeardown: effects.registerOnTeardown.bind(effects),
        unregister: effects.unregister.bind(effects)
    });

    const terminate = () => {
      if (typeof teardownFn === 'function'){
        teardownFn();
      }

      effects.ngOnDestroy();
    }

    return {
      terminate: () => terminate()
    }
}

