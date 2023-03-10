import {inject, InjectionToken} from "@angular/core";
import {WINDOW} from "@angular-kit/cdk/token";

export const SUPPORTS_MUTATION_OBSERVER = new InjectionToken<boolean>('ResizeObserver supported', {
  providedIn: 'root',
  factory: () => typeof (inject(WINDOW) as any)['MutationObserver'] !== 'undefined'
})
