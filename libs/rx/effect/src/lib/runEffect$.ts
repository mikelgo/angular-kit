import {catchError, EMPTY, Observable, Subscription, tap} from 'rxjs';
import {
  assertInInjectionContext,
  ChangeDetectorRef,
  ErrorHandler,
  inject,
  Injector,
  runInInjectionContext,
  ViewRef,
} from '@angular/core';

export type EffectFn = (v: any) => void;
export type Config = { injector?: Injector };

export function runEffect$(sub: Subscription, cfg?: Config): void;
export function runEffect$(source$: Observable<any>, cfg?: Config): void;
export function runEffect$(source$: Observable<unknown>, effect: EffectFn, cfg?: Config): void;
export function runEffect$(obsOrSub$: Observable<unknown> | Subscription, effectOrCRCfg?: EffectFn | Config): void {
  assertInInjectionContext(runEffect$);
  const effectFn = typeof effectOrCRCfg === 'function' ? effectOrCRCfg : undefined;
  const injector = typeof effectOrCRCfg === 'object' ? effectOrCRCfg.injector : undefined;

  const logic = () => {
    const sub = new Subscription();
    const errorHandler = inject(ErrorHandler);

    if (obsOrSub$ instanceof Subscription) {
      sub.add(obsOrSub$);
      return;
    }

    sub.add(
      obsOrSub$
        .pipe(
          // execute operation/ side effect
          tap(effectFn),
          catchError((err) => {
            errorHandler.handleError(err);
            return EMPTY;
          })
        )
        .subscribe()
    );

    onDestroy$(() => sub.unsubscribe());
  };

  if (injector) {
    runInInjectionContext(injector, () => {
      logic();
    });
  } else {
    logic();
  }
}

/**
 * @internal
 * @description
 * helper
 */
function onDestroy$(teardown: () => void) {
  const viewRef = inject(ChangeDetectorRef) as ViewRef;

  viewRef?.onDestroy(() => {
    teardown();
  });
}
