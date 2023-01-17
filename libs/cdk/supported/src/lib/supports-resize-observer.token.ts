import {inject, InjectionToken} from "@angular/core";
import {WINDOW} from "../../../token/src";

export const SUPPORTS_RESIZE_OBSERVER = new InjectionToken<boolean>('ResizeObserver supported', {
  providedIn: 'root',
  factory: () => typeof inject(WINDOW)['ResizeObserver'] !== 'undefined'
})
