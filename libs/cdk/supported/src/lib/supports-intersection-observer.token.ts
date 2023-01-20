import {inject, InjectionToken} from "@angular/core";
import {WINDOW} from "../../../token/src";

export const SUPPORTS_INTERSECTION_OBSERVER = new InjectionToken<boolean>('ResizeObserver supported', {
  providedIn: 'root',
  factory: () => typeof (inject(WINDOW) as any)['IntersectionObserver'] !== 'undefined'
})
