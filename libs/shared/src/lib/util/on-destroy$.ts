import {ChangeDetectorRef, inject, ViewRef} from "@angular/core";

/**
 * @internal
 * @description
 * helper
 */
export function onDestroy$(teardown: () => void) {
  const viewRef = inject(ChangeDetectorRef) as ViewRef;

  viewRef?.onDestroy(() => {
    teardown();
  });
}
