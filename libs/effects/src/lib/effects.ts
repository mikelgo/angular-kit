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

export type CleanUp = {
  cleanUp: () => void;
};
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
   *
   * @example
   * ```typescript
   * effects.register(of(1).subscribe(console.log));
   * ```
   */
  run(
    sub: Subscription,
    o?: {
      td?: () => void;
    }
  ): CleanUp;
  /**
   *
   * @example
   * ```typescript
   * effects.register(of(1).pipe(tap(console.log)));
   * ```
   */
  run<T>(
    o$: Observable<T>,
    o?: {
      td?: () => void;
    }
  ): CleanUp;
  /**
   *
   * @example
   * ```typescript
   * const trigger$ = of(1);
   * const effect = console.log;
   * effects.register(trigger$, effect);
   * ```
   */
  run<T>(o$: Observable<T>, sideEffectFn: (arg: T) => void, o?: { td?: () => void }): CleanUp;
  run<T>(
    obsOrSub$: Observable<T> | Subscription,
    sideEffectFn?: ((arg: T) => void) | { td?: () => void },
    o?: { td?: () => void }
  ): CleanUp {
    const effectId = Effects.nextId++;
    if (obsOrSub$ instanceof Subscription) {
      this.sub.add(obsOrSub$);
      this.idSubMap.set(effectId, obsOrSub$);

      return {
        cleanUp: () => {
          // TODO
          // if (sideEffectFn ?? typeof sideEffectFn === 'object') {
          //   // TODO if sideEffectFn.td() has already been executed, it should not be executed again in registerOnTeardown
          //   // @ts-ignore
          //   sideEffectFn.td?.();
          //   // @ts-ignore
          //   this.registerOnTeardown(() => sideEffectFn.td?.())
          // }
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
    return {
      cleanUp: () => {
        // TODO
        // if (sideEffectFn ?? typeof sideEffectFn === 'object') {
        //   // @ts-ignore
        //   sideEffectFn.td?.();
        //   // TODO if sideEffectFn.td() has already been executed, it should not be executed again in registerOnTeardown
        //   // @ts-ignore
        //   this.registerOnTeardown(() => sideEffectFn.td?.())
        // }
        // if (o){
        //   o.td?.();
        //   // TODO if sideEffectFn.td() has already been executed, it should not be executed again in registerOnTeardown
        //   // @ts-ignore
        //   this.registerOnTeardown(() => o.td?.());
        // }
        this.unregister(effectId);
      },
    };
  }

  /**
   * Execute a sideEffect when the instance OnDestroy hook is executed
   * @param sideEffectFn
   */
  runOnInstanceDestroy(sideEffectFn: () => void) {
    this.run(this.destroyHook$$.asObservable(), sideEffectFn);
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
 * A helper function to manage any RxJs subscription
 * @param setupFn
 * @param options
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
