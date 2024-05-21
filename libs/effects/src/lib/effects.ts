import {
  DestroyRef,
  ErrorHandler,
  inject,
  Injectable,
  Injector,
  OnDestroy,
  Optional,
  runInInjectionContext,
} from '@angular/core';
import { catchError, EMPTY, Observable, pipe, ReplaySubject, Subscription, tap } from 'rxjs';
import { assertInjector } from './assert-injector';

export type CleanUpRef = {
  cleanUp: () => void;
};

export function isCleanUpRefGuard(obj: any): obj is CleanUpRef {
  return typeof obj === 'object' && obj?.cleanUp !== undefined && typeof obj.cleanUp === 'function';
}

/**
 * @internal
 *
 * @description
 * Keeps track of your subscriptions and unsubscribes them automatically when destroyed.
 *
 */
@Injectable()
export class Effects implements OnDestroy {
  private static nextId = 0;
  private readonly sub = new Subscription();
  private readonly idSubMap = new Map<number, Subscription>();
  private readonly destroyHook$$ = new ReplaySubject<void>(1);

  constructor(@Optional() private readonly errorHandler: ErrorHandler | null) {}

  /**
   * @description
   * Manage the subscription of an observable and execute the side effect.
   *
   * Unsubscribes automatically when the provided {@link DestroyRef} is destroyed.
   *
   * Manually unsubscribe by calling {@link CleanUpRef.cleanUp}.
   *
   * @example
   * ```typescript
   * ef = effects(({run})=> run(source$.subscribe(console.log)))
   * ```
   * @param sub
   * @param options
   */
  run(
    sub: Subscription,
    options?: {
      cleanUp?: () => void;
    }
  ): CleanUpRef;
  /**
   * @description
   * Subscribe to the passed observable and execute the side effect.
   *
   * Unsubscribes automatically when the provided {@link DestroyRef} is destroyed.
   *
   * Manually unsubscribe by calling {@link CleanUpRef.cleanUp}.
   *
   * @example
   * ```typescript
   * ef = effects(({run})=> run(source$.pipe(tap(console.log))))
   * ```
   *
   * @param o$
   * @param options
   */
  run<T>(
    o$: Observable<T>,
    options?: {
      cleanUp?: () => void;
    }
  ): CleanUpRef;
  /**
   * @description
   * Subscribe to the passed observable and execute the side effect.
   *
   * Unsubscribes automatically when the provided {@link DestroyRef} is destroyed.
   *
   * Manually unsubscribe by calling {@link CleanUpRef.cleanUp}.
   *
   * @example
   * ```typescript
   * const trigger$ = of(1);
   * const effect = console.log;
   * ef = effects(({run})=> run(trigger$, effect))
   * ```
   *
   * @param o$
   * @param sideEffectFn
   * @param options
   */
  run<T>(o$: Observable<T>, sideEffectFn: (arg: T) => void, options?: { cleanUp?: () => void }): CleanUpRef;
  /**
   * @internal
   */
  run<T>(
    obsOrSub$: Observable<T> | Subscription,
    sideEffectFn?: ((arg: T) => void) | { cleanUp?: () => void },
    options?: { cleanUp?: () => void }
  ): CleanUpRef {
    const effectId = Effects.nextId++;

    if (obsOrSub$ instanceof Subscription) {
      this.sub.add(obsOrSub$);
      this.idSubMap.set(effectId, obsOrSub$);
      let runOnInstanceDestroySub: undefined | CleanUpRef = undefined;
      if (sideEffectFn ?? isCleanUpRefGuard(sideEffectFn)) {
        runOnInstanceDestroySub = this.runOnInstanceDestroy(() => (sideEffectFn as CleanUpRef).cleanUp?.());
      }

      return {
        cleanUp: () => {
          if (sideEffectFn ?? isCleanUpRefGuard(sideEffectFn)) {
            (sideEffectFn as CleanUpRef).cleanUp?.();
            runOnInstanceDestroySub?.cleanUp();
          }
          this.unregister(effectId);
        },
      };
    }

    const subscription = obsOrSub$
      .pipe(
        // execute operation/ side effect
        sideEffectFn && typeof sideEffectFn === 'function' ? tap(sideEffectFn) : pipe(),
        catchError((err) => {
          this.errorHandler?.handleError(err);
          return EMPTY;
        })
      )
      .subscribe();
    this.sub.add(subscription);
    this.idSubMap.set(effectId, subscription);

    // cases sideEffectFn is a CleanUpRef OR options given
    let runOnInstanceDestroySub: undefined | CleanUpRef = undefined;
    if (options && options.cleanUp) {
      runOnInstanceDestroySub = this.runOnInstanceDestroy(() => options.cleanUp?.());
    }
    if (sideEffectFn && isCleanUpRefGuard(sideEffectFn)) {
      runOnInstanceDestroySub = this.runOnInstanceDestroy(() => (sideEffectFn as CleanUpRef).cleanUp?.());
    }

    return {
      cleanUp: () => {
        if (options && options.cleanUp) {
          options.cleanUp?.();
          runOnInstanceDestroySub?.cleanUp();
        }
        if (sideEffectFn && isCleanUpRefGuard(sideEffectFn)) {
          (sideEffectFn as CleanUpRef).cleanUp?.();
          runOnInstanceDestroySub?.cleanUp();
        }
        this.unregister(effectId);
      },
    };
  }

  /**
   * Execute a sideEffect when the instance OnDestroy hook is executed
   * @param sideEffectFn
   */
  runOnInstanceDestroy(sideEffectFn: () => void) {
    return this.run(this.destroyHook$$.pipe(tap(sideEffectFn)).subscribe());
  }

  /**
   * Cancel a registered side effect
   * @param effectId
   */
  private unregister(effectId: number): void {
    const sub = this.idSubMap.get(effectId);
    if (sub) {
      sub.unsubscribe();
    }
  }

  cleanUp() {
    this.ngOnDestroy();
  }

  ngOnDestroy(): void {
    this.destroyHook$$.next(void 0);
    this.sub.unsubscribe();
  }
}

type TeardownFn = (() => void) | void;
type EffectsSetupFn = (rxEffect: Pick<Effects, 'run' | 'runOnInstanceDestroy' | 'cleanUp'>) => TeardownFn;

// TODO update JSdoc and update main documentation /README
/**
 * @description
 * Functional way to setup observable based side effects.
 *
 * It will destroy itself when the provided {@link DestroyRef} is destroyed.
 *
 * @param setupFn
 * @param options
 *
 * @example
 *
 * const ef = effects(({run, runOnInstanceDestroy}) => {
 *     run(source$, console.log)
 *
 *     run(source$.subscribe(console.log))
 *
 *     run(source$.pipe(tap(console.log)))
 *
 *     runOnInstanceDestroy(() => {
 *       // any teardown logic, e.g unsubscribe from any source, clear timers etc.
 *     })
 * })
 */
export function effects(setupFn?: EffectsSetupFn, options?: { injector?: Injector }): Effects {
  const injector = assertInjector(effects, options?.injector);
  return runInInjectionContext(injector, () => {
    const errorHandler = inject(ErrorHandler, { optional: true });
    const effects = new Effects(errorHandler);
    const destroyRef = inject(DestroyRef);
    const teardownFn = setupFn?.({
      run: effects.run.bind(effects),
      runOnInstanceDestroy: effects.runOnInstanceDestroy.bind(effects),
      cleanUp: effects.cleanUp.bind(effects),
    });

    const terminate = () => {
      if (typeof teardownFn === 'function') {
        teardownFn();
      }
      effects.ngOnDestroy();
    };
    destroyRef.onDestroy(() => terminate());

    return effects;
  });
}
